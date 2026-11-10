import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const qrcode = require("qrcode");
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import EventEmitter from "node:events";
import { setTimeout } from "node:timers";
import { fetch } from "undici";
import WebSocket from "ws";
import _ConstantsModule from "./Constants";

const { UserAgent } = _ConstantsModule;
import Options from "./Options";

const defaultClientOptions = Options.createDefault();

const baseURL = "https://discord.com/ra/";

const wsURL = "wss://remote-auth-gateway.discord.gg/?v=2";

const receiveEvent = {
  CANCEL: "cancel",
  HEARTBEAT_ACK: "heartbeat_ack",
  HELLO: "hello",
  NONCE_PROOF: "nonce_proof",
  PENDING_LOGIN: "pending_login",
  PENDING_REMOTE_INIT: "pending_remote_init",
  PENDING_TICKET: "pending_ticket",
};

const sendEvent = {
  HEARTBEAT: "heartbeat",
  INIT: "init",
  NONCE_PROOF: "nonce_proof",
};

const Event = {
  CANCEL: "cancel",
  CLOSED: "closed",
  DEBUG: "debug",
  ERROR: "error",
  FINISH: "finish",
  READY: "ready",
  WAIT_SCAN: "pending",
};

class DiscordAuthWebsocket extends EventEmitter {
  #ws: WebSocket | null = null;
  #heartbeatInterval = 0;
  #expire: Date | null = null;
  #publicKey = "";
  #privateKey = "";
  #ticket = "";
  #fingerprint = "";
  #userDecryptString = "";

  token: string;

  constructor() {
    super();
    this.token = "";
  }

  get AuthURL() {
    return baseURL + this.#fingerprint;
  }

  get exprire(): Date | null {
    return this.#expire;
  }

  get user(): unknown {
    return DiscordAuthWebsocket.decryptUser(this.#userDecryptString);
  }

  #createWebSocket(url: string) {
    this.#ws = new WebSocket(url, {
      headers: {
        Origin: "https://discord.com",
        "User-Agent": UserAgent,
      },
    });
    this.#handleWebSocket();
  }

  #handleWebSocket() {
    this.#ws!.on("error", (error: Error) => {
      this.emit(Event.ERROR, error);
    });
    this.#ws!.on("open", () => {
      this.emit(Event.DEBUG, "[WS] Client Connected");
    });
    this.#ws!.on("close", () => {
      this.emit(Event.DEBUG, "[WS] Connection closed");
    });
    this.#ws!.on("message", this.#handleMessage.bind(this));
  }

  #handleMessage(raw: unknown) {
    const message = JSON.parse(String(raw)) as Record<string, unknown>;
    switch (message.op) {
      case receiveEvent.HELLO: {
        this.#ready(message);
        break;
      }

      case receiveEvent.NONCE_PROOF: {
        this.#receiveNonceProof(message);
        break;
      }

      case receiveEvent.PENDING_REMOTE_INIT: {
        this.#fingerprint = message.fingerprint as string;
        this.emit(Event.READY, this);
        break;
      }

      case receiveEvent.HEARTBEAT_ACK: {
        this.emit(Event.DEBUG, `Heartbeat acknowledged.`);
        this.#heartbeatAck();
        break;
      }

      case receiveEvent.PENDING_TICKET: {
        this.#pendingLogin(message);
        break;
      }

      case receiveEvent.CANCEL: {
        this.emit(Event.CANCEL, this);
        this.destroy();
        break;
      }

      case receiveEvent.PENDING_LOGIN: {
        this.#ticket = message.ticket as string;
        this.#findRealToken();
        break;
      }
    }
  }

  #send(op: string, data?: Record<string, unknown>) {
    if (!this.#ws) {
      return;
    }
    let payload: Record<string, unknown> = { op };
    if (data !== null) {
      payload = { ...payload, ...data };
    }
    this.#ws.send(JSON.stringify(payload));
  }

  #heartbeatAck() {
    setTimeout(() => {
      this.#send(sendEvent.HEARTBEAT);
    }, this.#heartbeatInterval as number).unref();
  }

  #ready(data: Record<string, unknown>) {
    this.emit(Event.DEBUG, "Attempting server handshake...");
    this.#expire = new Date(Date.now() + (data.timeout_ms as number));
    this.#heartbeatInterval = data.heartbeat_interval as number;
    this.#createKey();
    this.#heartbeatAck();
    this.#init();
  }

  #createKey() {
    const key = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: {
        format: "pem",
        type: "pkcs1",
      },
      publicKeyEncoding: {
        format: "pem",
        type: "spki",
      },
    });
    this.#privateKey = key.privateKey;
    this.#publicKey = key.publicKey;
  }

  #encodePublicKey() {
    let pub_key = this.#publicKey;
    pub_key = pub_key.split("\n").slice(1, -2).join("");
    return pub_key;
  }

  #init() {
    const public_key = this.#encodePublicKey();
    this.#send(sendEvent.INIT, { encoded_public_key: public_key });
  }

  #receiveNonceProof(data: Record<string, unknown>) {
    const nonce = data.encrypted_nonce;
    const decrypted_nonce = this.#decryptPayload(nonce);
    const proof = Bun.CryptoHasher.hash("sha256", decrypted_nonce, "base64")
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+/, "")
      .replace(/\s+$/, "");
    this.#send(sendEvent.NONCE_PROOF, { proof });
  }

  #decryptPayload(encrypted_payload: unknown) {
    const payload = Buffer.from(String(encrypted_payload), "base64");
    const private_key = this.#privateKey;
    const data = crypto.privateDecrypt(
      {
        key: private_key,
        oaepHash: "sha256",
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      payload
    );
    return data;
  }

  #pendingLogin(data: Record<string, unknown>) {
    const user_data = this.#decryptPayload(data.encrypted_user_payload);
    this.#userDecryptString = user_data.toString();

    this.emit(Event.WAIT_SCAN, this.user);
  }

  #awaitLogin(client: unknown) {
    return new Promise<unknown>((r) => {
      this.once(Event.FINISH, (token: string) => {
        r((client as { login: (t: string) => unknown }).login(token));
      });
    });
  }

  connect(client?: unknown) {
    this.#createWebSocket(wsURL);
    if (client) {
      return this.#awaitLogin(client);
    }
    return Promise.resolve();
  }

  destroy() {
    if (!this.#ws) {
      return;
    }
    this.#ws.close();
    this.emit(Event.DEBUG, "WebSocket closed.");
    this.emit(Event.CLOSED);
  }

  generateQR() {
    if (!this.#fingerprint) {
      return;
    }
    qrcode.toString(
      this.AuthURL,
      { errorCorrectionLevel: "L", type: "utf8" },
      (err: Error | null, url: string) => {
        if (err) {
          //
        }
        console.log(url);
      }
    );
  }

  #findRealToken() {
    return fetch(`https://discord.com/api/v9/users/@me/remote-auth/login`, {
      body: JSON.stringify({
        ticket: this.#ticket,
      }),
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Origin: "https://discord.com",
        Referer: "https://discord.com/channels/@me",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": UserAgent,
        "X-Debug-Options": "bugReporterEnabled",
        "X-Discord-Locale": "en-US",
        "X-Super-Properties": `${Buffer.from(
          JSON.stringify(defaultClientOptions.ws.properties),
          "ascii"
        ).toString("base64")}`,
      },
      method: "POST",
    })
      .then((r) => r.json())
      .then((res: unknown) => {
        const resObj = res as Record<string, unknown>;
        if (resObj.encrypted_token) {
          this.token = this.#decryptPayload(resObj.encrypted_token).toString();
        }
        this.emit(Event.FINISH, this.token);
        this.destroy();
      })
      .catch(() => false);
  }

  static decryptUser(payload: unknown) {
    const values = String(payload).split(":");
    const id = values[0];
    const username = values[3];
    const discriminator = values[1];
    const avatar = values[2];
    return {
      avatar,
      discriminator,
      id,
      username,
    };
  }
}

export default DiscordAuthWebsocket;
export { DiscordAuthWebsocket };
