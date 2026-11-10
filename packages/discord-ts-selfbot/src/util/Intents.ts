import BitField from "./BitField";

("use strict");

class Intents extends BitField {
  static FLAGS: Record<string, number> = {};
  static ALL = 0;
}

Intents.FLAGS = {
  AUTO_MODERATION_CONFIGURATION: 1 << 20,
  AUTO_MODERATION_EXECUTION: 1 << 21,
  DIRECT_MESSAGES: 1 << 12,
  DIRECT_MESSAGE_REACTIONS: 1 << 13,
  DIRECT_MESSAGE_TYPING: 1 << 14,
  GUILDS: 1 << 0,
  GUILD_BANS: 1 << 2,
  GUILD_EMOJIS_AND_STICKERS: 1 << 3,
  GUILD_INTEGRATIONS: 1 << 4,
  GUILD_INVITES: 1 << 6,
  GUILD_MEMBERS: 1 << 1,
  GUILD_MESSAGES: 1 << 9,
  GUILD_MESSAGE_REACTIONS: 1 << 10,
  GUILD_MESSAGE_TYPING: 1 << 11,
  GUILD_PRESENCES: 1 << 8,
  GUILD_SCHEDULED_EVENTS: 1 << 16,
  GUILD_VOICE_STATES: 1 << 7,
  GUILD_WEBHOOKS: 1 << 5,
  MESSAGE_CONTENT: 1 << 15,
};

Intents.ALL = Object.values(Intents.FLAGS).reduce(
  (all: number, p: number) => all | p,
  0
);

export default Intents;
export { Intents };
