/**
 * A loose-but-safe alias for raw Discord API payloads.
 *
 * Use this instead of `any` when a value is an untyped blob coming from the
 * Discord HTTP/gateway boundary. It is `Record<string, unknown>`, so property
 * access yields `unknown` and callers must narrow before use.
 *
 * This is the only sanctioned `any`-substitute for raw payloads; see ADR 0003.
 */
export type DiscordPayload = Record<string, unknown>;
