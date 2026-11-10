import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { RtpPacket } from "werift-rtp";
import secretbox from "./Secretbox";

const UNPADDED_NONCE_LENGTH = 4;
const AUTH_TAG_LENGTH = 16;

interface RtpAuthentication {
  secret_key?: Uint8Array;
  mode?: string;
}

const RtpDecryptor = {
  decrypt(
    buffer: Buffer,
    authentication: RtpAuthentication
  ): RtpPacket | Error {
    const { secret_key, mode } = authentication;
    if (!secret_key) return new Error("secret_key cannot be null or undefined");
    const nonce =
      mode === "aead_aes256_gcm_rtpsize" ? Buffer.alloc(12) : Buffer.alloc(24);
    buffer.copy(nonce, 0, buffer.length - UNPADDED_NONCE_LENGTH);

    let headerSize = 12;
    const first = buffer.readUint8();
    if ((first >> 4) & 0x01) headerSize += 4;

    const header = buffer.slice(0, headerSize);
    const encrypted = buffer.slice(
      headerSize,
      buffer.length - AUTH_TAG_LENGTH - UNPADDED_NONCE_LENGTH
    );
    const authTag = buffer.slice(
      buffer.length - AUTH_TAG_LENGTH - UNPADDED_NONCE_LENGTH,
      buffer.length - UNPADDED_NONCE_LENGTH
    );

    let packet: Buffer;
    switch (mode) {
      case "aead_aes256_gcm_rtpsize": {
        const decipheriv = crypto.createDecipheriv(
          "aes-256-gcm",
          secret_key,
          nonce
        );
        decipheriv.setAAD(header);
        decipheriv.setAuthTag(authTag);
        packet = Buffer.concat([
          decipheriv.update(encrypted),
          decipheriv.final(),
        ]);
        break;
      }
      case "aead_xchacha20_poly1305_rtpsize": {
        const decrypted =
          secretbox.methods.crypto_aead_xchacha20poly1305_ietf_decrypt(
            Buffer.concat([encrypted, authTag]),
            header,
            nonce,
            secret_key
          );
        packet = Buffer.from(decrypted);
        break;
      }
      default: {
        return new RangeError(`Unsupported decryption method: ${mode}`);
      }
    }

    return RtpPacket.deSerialize(Buffer.concat([header, packet]));
  },
};

export default RtpDecryptor;
export { RtpDecryptor };
