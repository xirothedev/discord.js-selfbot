import BitField from "./BitField";

class UserFlags extends BitField {}

UserFlags.FLAGS = {
  // User is an active developer.
  ACTIVE_DEVELOPER: 1 << 22,
  BOT_HTTP_INTERACTIONS: 1 << 19,
  BUGHUNTER_LEVEL_1: 1 << 3,
  BUGHUNTER_LEVEL_2: 1 << 14,
  // [Undocumented] User is a collaborator and has staff permissions.
  COLLABORATOR: 2 ** 50,
  // [Undocumented] Account has been deleted.
  DELETED: 2 ** 34,
  // [Undocumented] User is currently temporarily or permanently disabled.
  DISABLED: 2 ** 41,
  // [Undocumented] Account has been disabled for suspicious activity.
  DISABLED_SUSPICIOUS_ACTIVITY: 2 ** 35,
  // [Undocumented] Forcefully disables Nitro features.
  DISABLE_PREMIUM: 1 << 21,
  DISCORD_CERTIFIED_MODERATOR: 1 << 18,
  DISCORD_EMPLOYEE: 1,
  EARLY_SUPPORTER: 1 << 9,
  EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
  // [Undocumented] User has unread messages from Discord.
  HAS_UNREAD_URGENT_MESSAGES: 1 << 13,
  // [Undocumented] User is a high global rate limit.
  HIGH_GLOBAL_RATE_LIMIT: 2 ** 33,
  HOUSE_BALANCE: 1 << 8,
  HOUSE_BRAVERY: 1 << 6,
  HOUSE_BRILLIANCE: 1 << 7,
  HYPESQUAD_EVENTS: 1 << 2,
  // [Undocumented] An internal flag accidentally leaked to the client's private flags.
  // Relates to partner/verification applications but nothing else is known.
  INTERNAL_APPLICATION: 1 << 11,
  // [Undocumented] User has SMS 2FA enabled.
  MFA_SMS: 1 << 4,
  PARTNERED_SERVER_OWNER: 1 << 1,
  // [Undocumented] User has a premium discriminator.
  PREMIUM_DISCRIMINATOR: 2 ** 37,
  // [Undocumented] Presumably some sort of Discord Nitro promotion that the user dismissed.
  PREMIUM_PROMO_DISMISSED: 1 << 5,
  // [Undocumented] User is quarantined.
  QUARANTINED: 2 ** 44,
  // [Undocumented] User is a restricted collaborator and has staff permissions.
  RESTRICTED_COLLABORATOR: 2 ** 51,
  // [Undocumented] Account was deleted by the user.
  SELF_DELETED: 2 ** 36,
  // [Undocumented] User is marked as a spammer.
  SPAMMER: 1 << 20,
  // [Undocumented] Account is a Discord system account.
  SYSTEM: 1 << 12,
  TEAM_USER: 1 << 10,
  // [Undocumented] Unused. User was deleted for being underage.
  UNDERAGE_DELETED: 1 << 15,
  // [Undocumented] User has used the desktop client.
  USED_DESKTOP_CLIENT: 2 ** 38,
  // [Undocumented] User has used the mobile client.
  USED_MOBILE_CLIENT: 2 ** 40,
  // [Undocumented] User has used the web client.
  USED_WEB_CLIENT: 2 ** 39,
  VERIFIED_BOT: 1 << 16,
  // [Undocumented] User has a verified email on their account.
  VERIFIED_EMAIL: 2 ** 43,
};

export default UserFlags;
export { UserFlags };
