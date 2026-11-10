interface SecretboxMethods {
  crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext: Uint8Array,
    additionalData: Uint8Array | null,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;
  crypto_aead_xchacha20poly1305_ietf_decrypt(
    plaintext: Uint8Array,
    additionalData: Uint8Array | null,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;
}

interface StableLibModule {
  XChaCha20Poly1305: new (key: Uint8Array) => {
    seal(nonce: Uint8Array, plaintext: Uint8Array, additionalData: Uint8Array | null): Uint8Array;
    open(nonce: Uint8Array, plaintext: Uint8Array, additionalData: Uint8Array | null): Uint8Array;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function callMethod(target: Record<string, unknown>, name: string, args: unknown[]): Uint8Array {
  const method = target[name];
  if (typeof method !== 'function') throw new Error(`Missing crypto method: ${name}`);
  const result: unknown = Reflect.apply(method, target, args);
  if (!(result instanceof Uint8Array)) throw new Error(`Invalid crypto result from: ${name}`);
  return result;
}

function isStableLib(value: unknown): value is StableLibModule {
  return isRecord(value) && 'XChaCha20Poly1305' in value && typeof value.XChaCha20Poly1305 === 'function';
}

const libs: Record<string, (module: unknown) => SecretboxMethods> = {
  sodium: (sodium: unknown) => {
    const api = isRecord(sodium) && isRecord(sodium.api) ? sodium.api : isRecord(sodium) ? sodium : {};
    return {
      crypto_aead_xchacha20poly1305_ietf_encrypt: (plaintext, additionalData, nonce, key) =>
        callMethod(api, 'crypto_aead_xchacha20poly1305_ietf_encrypt', [plaintext, additionalData, null, nonce, key]),
      crypto_aead_xchacha20poly1305_ietf_decrypt: (plaintext, additionalData, nonce, key) =>
        callMethod(api, 'crypto_aead_xchacha20poly1305_ietf_decrypt', [plaintext, additionalData, null, nonce, key]),
    };
  },
  'libsodium-wrappers': (sodium: unknown) => {
    const api = isRecord(sodium) ? sodium : {};
    return {
      crypto_aead_xchacha20poly1305_ietf_encrypt: (plaintext, additionalData, nonce, key) =>
        callMethod(api, 'crypto_aead_xchacha20poly1305_ietf_encrypt', [plaintext, additionalData, null, nonce, key]),
      crypto_aead_xchacha20poly1305_ietf_decrypt: (plaintext, additionalData, nonce, key) =>
        callMethod(api, 'crypto_aead_xchacha20poly1305_ietf_decrypt', [null, plaintext, additionalData, nonce, key]),
    };
  },
  '@stablelib/xchacha20poly1305': (stablelib: unknown) => {
    if (!isStableLib(stablelib)) throw new Error('Invalid @stablelib/xchacha20poly1305 module');
    return {
      crypto_aead_xchacha20poly1305_ietf_encrypt(cipherText, additionalData, nonce, key) {
        const crypto = new stablelib.XChaCha20Poly1305(key);
        return crypto.seal(nonce, cipherText, additionalData);
      },
      crypto_aead_xchacha20poly1305_ietf_decrypt(plaintext, additionalData, nonce, key) {
        const crypto = new stablelib.XChaCha20Poly1305(key);
        return crypto.open(nonce, plaintext, additionalData);
      },
    };
  },
};

function NoLib(): never {
  throw new Error(
    'Cannot play audio as no valid encryption package is installed.\n- Install sodium, libsodium-wrappers, or @stablelib/xchacha20poly1305.',
  );
}

const secretbox: { methods: SecretboxMethods } = {
  methods: {
    crypto_aead_xchacha20poly1305_ietf_encrypt: NoLib,
    crypto_aead_xchacha20poly1305_ietf_decrypt: NoLib,
  },
};

async function importModule(name: string): Promise<unknown> {
  return await import(name);
}

(async () => {
  for (const libName of Object.keys(libs)) {
    try {
      const mod = await importModule(libName);
      const lib = isRecord(mod) && 'default' in mod ? mod.default : mod;
      if (libName === 'libsodium-wrappers' && isRecord(lib) && lib.ready) await lib.ready; // eslint-disable-line no-await-in-loop
      const factory = libs[libName];
      if (factory) secretbox.methods = factory(lib);
      break;
    } catch {} // eslint-disable-line no-empty
  }
})();

export default secretbox;
export { secretbox };
