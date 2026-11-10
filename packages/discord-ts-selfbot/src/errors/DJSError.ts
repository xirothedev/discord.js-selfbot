// Heavily inspired by node's `internal/errors` module

const kCode = Symbol("code");
type MessageBuilder = (...args: never[]) => string;
const messages = new Map<string, string | MessageBuilder>();

interface DiscordjsErrorConstructor {
  new (key: string, ...args: unknown[]): Error & { code: string };
  readonly prototype: Error;
}

function message(key: string, args: unknown[]): string {
  if (typeof key !== "string") {
    throw new TypeError("Error message key must be a string");
  }
  const msg = messages.get(key);
  if (!msg) {
    throw new Error(`An invalid error message key was used: ${key}.`);
  }
  if (typeof msg === "function") {
    return String(Reflect.apply(msg, undefined, args));
  }
  if (!args?.length) {
    return msg;
  }
  args.unshift(msg);
  return String(...args);
}

function makeDiscordjsError(Base: ErrorConstructor): DiscordjsErrorConstructor {
  return class DiscordjsError extends Base {
    [kCode]: string;

    constructor(key: string, ...args: unknown[]) {
      super(message(key, args));
      this[kCode] = key;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DiscordjsError);
      }
    }

    override get name(): string {
      return `${super.name} [${this[kCode]}]`;
    }

    get code(): string {
      return this[kCode];
    }
  };
}

function register(sym: string, val: string | MessageBuilder): void {
  messages.set(sym, typeof val === "function" ? val : String(val));
}

const DiscordjsError = {
  Error: makeDiscordjsError(globalThis.Error),
  RangeError: makeDiscordjsError(globalThis.RangeError),
  TypeError: makeDiscordjsError(globalThis.TypeError),
  register,
};

export default DiscordjsError;
export { DiscordjsError };
