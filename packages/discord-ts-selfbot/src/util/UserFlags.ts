import BitField from "./BitField";

("use strict");

class UserFlags extends BitField {}

UserFlags.FLAGS = {
  ACTIVE_DEVELOPER: 1 << 22, // User is an active developer.
  BOT_HTTP_INTERACTIONS: 1 << 19,
  BUGHUNTER_LEVEL_1: 1 << 3,
  BUGHUNTER_LEVEL_2: 1 << 14,
  COLLABORATOR: Math.pow(2, 50), // [Undocumented] User is a collaborator and has staff permissions.
  DELETED: Math.pow(2, 34), // [Undocumented] Account has been deleted.
  DISABLED: Math.pow(2, 41), // [Undocumented] User is currently temporarily or permanently disabled.
  DISABLED_SUSPICIOUS_ACTIVITY: Math.pow(2, 35), // [Undocumented] Account has been disabled for suspicious activity.
  DISABLE_PREMIUM: 1 << 21, // [Undocumented] Forcefully disables Nitro features.
  DISCORD_CERTIFIED_MODERATOR: 1 << 18,
  DISCORD_EMPLOYEE: 1 << 0,
  EARLY_SUPPORTER: 1 << 9,
  EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
  HAS_UNREAD_URGENT_MESSAGES: 1 << 13, // [Undocumented] User has unread messages from Discord.
  HIGH_GLOBAL_RATE_LIMIT: Math.pow(2, 33), // [Undocumented] User is a high global rate limit.
  HOUSE_BALANCE: 1 << 8,
  HOUSE_BRAVERY: 1 << 6,
  HOUSE_BRILLIANCE: 1 << 7,
  HYPESQUAD_EVENTS: 1 << 2,
  INTERNAL_APPLICATION: 1 << 11, // [Undocumented] An internal flag accidentally leaked to the client's private flags. Relates to partner/verification applications but nothing else is known.
  MFA_SMS: 1 << 4, // [Undocumented] User has SMS 2FA enabled.
  PARTNERED_SERVER_OWNER: 1 << 1,
  PREMIUM_DISCRIMINATOR: Math.pow(2, 37), // [Undocumented] User has a premium discriminator.
  PREMIUM_PROMO_DISMISSED: 1 << 5, // [Undocumented] Presumably some sort of Discord Nitro promotion that the user dismissed.
  QUARANTINED: Math.pow(2, 44), // [Undocumented] User is quarantined.
  RESTRICTED_COLLABORATOR: Math.pow(2, 51), // [Undocumented] User is a restricted collaborator and has staff permissions.
  SELF_DELETED: Math.pow(2, 36), // [Undocumented] Account was deleted by the user.
  SPAMMER: 1 << 20, // [Undocumented] User is marked as a spammer.
  SYSTEM: 1 << 12, // [Undocumented] Account is a Discord system account.
  TEAM_USER: 1 << 10,
  UNDERAGE_DELETED: 1 << 15, // [Undocumented] Unused. User was deleted for being underage.
  USED_DESKTOP_CLIENT: Math.pow(2, 38), // [Undocumented] User has used the desktop client.
  USED_MOBILE_CLIENT: Math.pow(2, 40), // [Undocumented] User has used the mobile client.
  USED_WEB_CLIENT: Math.pow(2, 39), // [Undocumented] User has used the web client.
  VERIFIED_BOT: 1 << 16,
  VERIFIED_EMAIL: Math.pow(2, 43), // [Undocumented] User has a verified email on their account.
};

export default UserFlags;
export { UserFlags };
