import { createCipheriv, createDecipheriv } from "node:crypto";

import type { BenchCase } from "../types";

const KEY = new Uint8Array(32).fill(1);
const IV = new Uint8Array(12).fill(2);
const HEADER = new Uint8Array(12).fill(3);
const PAYLOAD = new Uint8Array(160).fill(4);

function seal(): {
  body: Buffer;
  tag: Buffer;
  combined: Uint8Array<ArrayBuffer>;
} {
  const cipher = createCipheriv("aes-256-gcm", KEY, IV);
  cipher.setAAD(HEADER);
  const body = Buffer.concat([cipher.update(PAYLOAD), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = new Uint8Array(body.byteLength + tag.byteLength);
  combined.set(body);
  combined.set(tag, body.byteLength);
  return { body, combined, tag };
}

export function createVoiceCases(): BenchCase[] {
  const sealed = seal();
  let keyPromise: Promise<CryptoKey> | null = null;
  const key = () => {
    keyPromise ??= crypto.subtle.importKey(
      "raw",
      KEY,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
    return keyPromise;
  };

  return [
    {
      bun: async () => {
        const output = await crypto.subtle.encrypt(
          { additionalData: HEADER, iv: IV, name: "AES-GCM" },
          await key(),
          PAYLOAD
        );
        return output.byteLength;
      },
      bytes: PAYLOAD.byteLength,
      group: "voice",
      id: "voice.aesgcm.encrypt",
      iterations: 5000,
      label: "AES-GCM encrypt 160 B",
      node: () => {
        const cipher = createCipheriv("aes-256-gcm", KEY, IV);
        cipher.setAAD(HEADER);
        const body = Buffer.concat([cipher.update(PAYLOAD), cipher.final()]);
        return body.byteLength + cipher.getAuthTag().byteLength;
      },
    },
    {
      bun: async () => {
        const output = await crypto.subtle.decrypt(
          {
            additionalData: HEADER,
            iv: IV,
            name: "AES-GCM",
          },
          await key(),
          sealed.combined
        );
        return output.byteLength;
      },
      bytes: PAYLOAD.byteLength,
      group: "voice",
      id: "voice.aesgcm.decrypt",
      iterations: 5000,
      label: "AES-GCM decrypt 160 B",
      node: () => {
        const decipher = createDecipheriv("aes-256-gcm", KEY, IV);
        decipher.setAAD(HEADER);
        decipher.setAuthTag(sealed.tag);
        return Buffer.concat([decipher.update(sealed.body), decipher.final()])
          .byteLength;
      },
    },
  ];
}
