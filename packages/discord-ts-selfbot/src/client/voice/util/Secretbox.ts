interface SecretboxMethods {
  crypto_aead_xchacha20poly1305_ietf_encrypt: (
    plaintext: Uint8Array,
    additionalData: Uint8Array | null,
    nonce: Uint8Array,
    key: Uint8Array
  ) => Uint8Array;
  crypto_aead_xchacha20poly1305_ietf_decrypt: (
    plaintext: Uint8Array,
    additionalData: Uint8Array | null,
    nonce: Uint8Array,
    key: Uint8Array
  ) => Uint8Array;
}

interface StableLibModule {
  XChaCha20Poly1305: new (key: Uint8Array) => {
    seal: (
      nonce: Uint8Array,
      plaintext: Uint8Array,
      additionalData: Uint8Array | null
    ) => Uint8Array;
    open: (
      nonce: Uint8Array,
      plaintext: Uint8Array,
      additionalData: Uint8Array | null
    ) => Uint8Array;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function callMethod(
  target: Record<string, unknown>,
  name: string,
  args: unknown[]
): Uint8Array {
  const method = target[name];
  if (typeof method !== "function") {
    throw new TypeError(`Missing crypto method: ${name}`);
  }
  const result: unknown = Reflect.apply(method, target, args);
  if (!(result instanceof Uint8Array)) {
    throw new Error(`Invalid crypto result from: ${name}`);
  }
  return result;
}

function isStableLib(value: unknown): value is StableLibModule {
  return (
    isRecord(value) &&
    "XChaCha20Poly1305" in value &&
    typeof value.XChaCha20Poly1305 === "function"
  );
}

const libs: Record<string, (module: unknown) => SecretboxMethods> = {
  "@stablelib/xchacha20poly1305": (stablelib: unknown) => {
    if (!isStableLib(stablelib)) {
      throw new Error("Invalid @stablelib/xchacha20poly1305 module");
    }
    return {
      crypto_aead_xchacha20poly1305_ietf_decrypt(
        plaintext,
        additionalData,
        nonce,
        key
      ) {
        const crypto = new stablelib.XChaCha20Poly1305(key);
        return crypto.open(nonce, plaintext, additionalData);
      },
      crypto_aead_xchacha20poly1305_ietf_encrypt(
        cipherText,
        additionalData,
        nonce,
        key
      ) {
        const crypto = new stablelib.XChaCha20Poly1305(key);
        return crypto.seal(nonce, cipherText, additionalData);
      },
    };
  },
  "libsodium-wrappers": (sodium: unknown) => {
    const api = isRecord(sodium) ? sodium : {};
    return {
      crypto_aead_xchacha20poly1305_ietf_decrypt: (
        plaintext,
        additionalData,
        nonce,
        key
      ) =>
        callMethod(api, "crypto_aead_xchacha20poly1305_ietf_decrypt", [
          null,
          plaintext,
          additionalData,
          nonce,
          key,
        ]),
      crypto_aead_xchacha20poly1305_ietf_encrypt: (
        plaintext,
        additionalData,
        nonce,
        key
      ) =>
        callMethod(api, "crypto_aead_xchacha20poly1305_ietf_encrypt", [
          plaintext,
          additionalData,
          null,
          nonce,
          key,
        ]),
    };
  },
  sodium: (sodium: unknown) => {
    let api: Record<string, unknown> = {};
    if (isRecord(sodium)) {
      api = isRecord(sodium.api) ? sodium.api : sodium;
    }
    return {
      crypto_aead_xchacha20poly1305_ietf_decrypt: (
        plaintext,
        additionalData,
        nonce,
        key
      ) =>
        callMethod(api, "crypto_aead_xchacha20poly1305_ietf_decrypt", [
          plaintext,
          additionalData,
          null,
          nonce,
          key,
        ]),
      crypto_aead_xchacha20poly1305_ietf_encrypt: (
        plaintext,
        additionalData,
        nonce,
        key
      ) =>
        callMethod(api, "crypto_aead_xchacha20poly1305_ietf_encrypt", [
          plaintext,
          additionalData,
          null,
          nonce,
          key,
        ]),
    };
  },
};

function NoLib(): never {
  throw new Error(
    "Cannot play audio as no valid encryption package is installed.\n- Install sodium, libsodium-wrappers, or @stablelib/xchacha20poly1305."
  );
}

const secretbox: { methods: SecretboxMethods } = {
  methods: {
    crypto_aead_xchacha20poly1305_ietf_decrypt: NoLib,
    crypto_aead_xchacha20poly1305_ietf_encrypt: NoLib,
  },
};

async function importModule(name: string): Promise<unknown> {
  return await import(name);
}

async function importSecretbox(
  libName: string
): Promise<SecretboxMethods | null> {
  try {
    const mod = await importModule(libName);
    const lib = isRecord(mod) && "default" in mod ? mod.default : mod;
    if (libName === "libsodium-wrappers" && isRecord(lib) && lib.ready) {
      await lib.ready;
    }
    const factory = libs[libName];
    return factory ? factory(lib) : null;
  } catch {
    // Ignore a missing or broken encryption package and try the next one.
    return null;
  }
}

async function loadSecretbox(
  libNames: readonly string[],
  index = 0
): Promise<void> {
  const libName = libNames[index];
  if (libName === undefined) {
    return;
  }
  const methods = await importSecretbox(libName);
  if (methods) {
    secretbox.methods = methods;
    return;
  }
  await loadSecretbox(libNames, index + 1);
}

void loadSecretbox(Object.keys(libs));

export default secretbox;
export { secretbox };
