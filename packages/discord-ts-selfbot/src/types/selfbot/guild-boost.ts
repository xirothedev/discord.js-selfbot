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
