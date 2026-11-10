// Wire constants for Discord's remote auth gateway.

export const baseURL = "https://discord.com/ra/";

export const wsURL = "wss://remote-auth-gateway.discord.gg/?v=2";

export const receiveEvent = {
  CANCEL: "cancel",
  HEARTBEAT_ACK: "heartbeat_ack",
  HELLO: "hello",
  NONCE_PROOF: "nonce_proof",
  PENDING_LOGIN: "pending_login",
  PENDING_REMOTE_INIT: "pending_remote_init",
  PENDING_TICKET: "pending_ticket",
};

export const sendEvent = {
  HEARTBEAT: "heartbeat",
  INIT: "init",
  NONCE_PROOF: "nonce_proof",
};

export const Event = {
  CANCEL: "cancel",
  CLOSED: "closed",
  DEBUG: "debug",
  ERROR: "error",
  FINISH: "finish",
  READY: "ready",
  WAIT_SCAN: "pending",
};
