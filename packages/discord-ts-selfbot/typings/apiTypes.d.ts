// Loose-but-structured interfaces for selfbot-only endpoints documented on
// https://docs.discord.food/ that have no official discord-api-types equivalent.
// Field names follow the discord.food documentation; all fields optional.

interface UserProfile {
  bio?: string | null;
  banner?: string | null;
  accent_color?: number | null;
  pronouns?: string | null;
  theme_colors?: number[] | null;
  popout_animation_particle_type?: number | null;
  emoji?: unknown;
  [key: string]: unknown;
}

interface RecentMention {
  id?: string;
  channel_id?: string;
  guild_id?: string;
  author?: unknown;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface SavedMessage {
  channel_id?: string;
  message_id?: string;
  saved_at?: string;
  notes?: string;
  [key: string]: unknown;
}

interface UserAffinity {
  user_id?: string;
  affinity?: number;
  communication_disabled_until?: string | null;
  [key: string]: unknown;
}

interface GuildAffinity {
  guild_id?: string;
  affinity?: number;
  [key: string]: unknown;
}

interface ChannelAffinity {
  channel_id?: string;
  affinity?: number;
  [key: string]: unknown;
}

interface UserConnection {
  id: string;
  type?: string;
  name?: string;
  verified?: boolean;
  friend_sync?: boolean;
  show_activity?: boolean;
  visibility?: number;
  metadata_visibility?: number;
  revoked?: boolean;
  integrations?: unknown[];
  two_way_link?: boolean;
  name?: string;
  verified?: boolean;
  friend_sync?: boolean;
  show_activity?: boolean;
  visibility?: number;
  metadata_visibility?: number;
  revoked?: boolean;
  integrations?: unknown[];
  [key: string]: unknown;
}

interface UserConsent {
  [key: string]: unknown;
}

interface EmailSettings {
  email?: string | null;
  verified?: boolean;
  [key: string]: unknown;
}

interface NotificationSettings {
  [key: string]: unknown;
}

interface UserHarvest {
  request_id?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface RecentAvatar {
  avatar?: string;
  uploaded_at?: string;
  [key: string]: unknown;
}

interface GuildBasic {
  id?: string;
  name?: string;
  icon?: string | null;
  [key: string]: unknown;
}

interface GuildJoinRequest {
  id?: string;
  user_id?: string;
  guild_id?: string;
  status?: number;
  created_at?: string;
  [key: string]: unknown;
}

interface SoundboardSound {
  sound_id?: string;
  name?: string;
  volume?: number;
  emoji_id?: string | null;
  emoji_name?: string | null;
  guild_id?: string;
  available?: boolean;
  [key: string]: unknown;
}

interface DiscoveryMetadata {
  [key: string]: unknown;
}

interface OnboardingAllowedApplication {
  id?: string;
  type?: number;
  [key: string]: unknown;
}

interface TopGame {
  application_id?: string;
  name?: string;
  count?: number;
  [key: string]: unknown;
}

interface BanSearchResult {
  user?: unknown;
  reason?: string | null;
  [key: string]: unknown;
}

interface FriendSuggestion {
  suggested_user?: unknown;
  reasons?: unknown[];
  [key: string]: unknown;
}

interface GameRelationship {
  user_id?: string;
  application_id?: string;
  type?: number;
  [key: string]: unknown;
}

interface ForumTag {
  id?: string;
  name?: string;
  moderated?: boolean;
  emoji_id?: string | null;
  emoji_name?: string | null;
  [key: string]: unknown;
}

interface InteractionData {
  [key: string]: unknown;
}

interface JoinRequestCooldown {
  retry_after?: number;
  [key: string]: unknown;
}

interface DiscoveryCategory {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

interface DiscoverableGuild {
  id?: string;
  name?: string;
  icon?: string | null;
  description?: string | null;
  banner?: string | null;
  splash?: string | null;
  discovery_splash?: string | null;
  features?: string[];
  vanity_url_code?: string | null;
  preferred_locale?: string;
  premium_subscription_count?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  emojis?: unknown[];
  emoji_count?: number;
  stickers?: unknown[];
  sticker_count?: number;
  auto_removed?: boolean;
  primary_category_id?: number;
  primary_category?: DiscoveryCategory;
  keywords?: string[] | null;
  is_published?: boolean;
  reasons_to_join?: unknown[];
  social_links?: string[] | null;
  about?: string | null;
  category_ids?: string[];
  categories?: DiscoveryCategory[];
  created_at?: string;
  nsfw_properties?: unknown;
  [key: string]: unknown;
}

interface DiscoverableGuildsQuery {
  guild_ids?: string[];
  application_ids?: string[];
  categories?: number[];
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

interface DiscoverableGuildsResult {
  guilds?: DiscoverableGuild[];
  total?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

interface DiscoverySlug {
  slug?: string;
  guild?: DiscoverableGuild;
  store_page?: unknown;
  [key: string]: unknown;
}

interface AutoModerationValidationResult {
  [key: string]: unknown;
}
