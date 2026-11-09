/**
 * The user-account premium guild subscription shape.
 *
 * This object is not part of the bot API; it comes from the user account's
 * premium subscription endpoints.
 */
export interface SelfbotGuildBoostData {
  id?: string;
  subscription_id?: string;
  premium_guild_subscription?: {
    id?: string;
    guild_id?: string;
    ended?: boolean;
  } | null;
  canceled?: boolean;
  cooldown_ends_at?: string | null;
}
