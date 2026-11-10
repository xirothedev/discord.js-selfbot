import type { BitFieldResolvable } from './BitField';
import BitField from './BitField';

class Permissions extends BitField {
  static ALL = 0n;
  static DEFAULT = 0n;
  static STAGE_MODERATOR = 0n;

  override missing(bits: BitFieldResolvable, checkAdmin = true): string[] {
    return checkAdmin && this.has(Permissions.FLAGS.ADMINISTRATOR)
      ? []
      : super.missing(bits);
  }

  override any(permission: BitFieldResolvable, checkAdmin = true): boolean {
    return (
      (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) ||
      super.any(permission)
    );
  }

  override has(permission: BitFieldResolvable, checkAdmin = true): boolean {
    return (
      (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) ||
      super.has(permission)
    );
  }

  override toArray(): string[] {
    return super.toArray(false);
  }
}

Permissions.FLAGS = {
  ADD_REACTIONS: 1n << 6n,
  ADMINISTRATOR: 1n << 3n,
  ATTACH_FILES: 1n << 15n,
  BAN_MEMBERS: 1n << 2n,
  CHANGE_NICKNAME: 1n << 26n,
  CONNECT: 1n << 20n,
  CREATE_EVENTS: 1n << 44n,
  CREATE_GUILD_EXPRESSIONS: 1n << 43n,
  CREATE_INSTANT_INVITE: 1n << 0n,
  CREATE_PRIVATE_THREADS: 1n << 36n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  DEAFEN_MEMBERS: 1n << 23n,
  EMBED_LINKS: 1n << 14n,
  KICK_MEMBERS: 1n << 1n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_MESSAGES: 1n << 13n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_THREADS: 1n << 34n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MENTION_EVERYONE: 1n << 17n,
  MODERATE_MEMBERS: 1n << 40n,
  MOVE_MEMBERS: 1n << 24n,
  MUTE_MEMBERS: 1n << 22n,
  PRIORITY_SPEAKER: 1n << 8n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  REQUEST_TO_SPEAK: 1n << 32n,
  SEND_MESSAGES: 1n << 11n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  SEND_POLLS: 1n << 49n,
  SEND_TTS_MESSAGES: 1n << 12n,
  SEND_VOICE_MESSAGES: 1n << 46n,
  SET_VOICE_CHANNEL_STATUS: 1n << 48n,
  SPEAK: 1n << 21n,
  START_EMBEDDED_ACTIVITIES: 1n << 39n,
  STREAM: 1n << 9n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  USE_CLYDE_AI: 1n << 47n,
  USE_EXTERNAL_APPS: 1n << 50n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  USE_EXTERNAL_SOUNDS: 1n << 45n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  USE_PRIVATE_THREADS: 1n << 36n,
  // The deprecated USE_*_THREADS aliases stay for v14 parity.
  USE_PUBLIC_THREADS: 1n << 35n,
  USE_SOUNDBOARD: 1n << 42n,
  USE_VAD: 1n << 25n,
  VIEW_AUDIT_LOG: 1n << 7n,
  VIEW_CHANNEL: 1n << 10n,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
};

Permissions.ALL = Object.values(Permissions.FLAGS).reduce(
  (all: bigint, part: number | bigint) => (all as bigint) | (part as bigint),
  0n
);

Permissions.DEFAULT = 104_324_673n;

Permissions.STAGE_MODERATOR =
  (Permissions.FLAGS.MANAGE_CHANNELS as bigint) |
  (Permissions.FLAGS.MUTE_MEMBERS as bigint) |
  (Permissions.FLAGS.MOVE_MEMBERS as bigint);

Permissions.defaultBit = 0n;

export default Permissions;
export { Permissions };
