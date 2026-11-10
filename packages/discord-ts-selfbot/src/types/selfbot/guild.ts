import type {
  APIGuildChannel,
  APIEmoji,
  APIGuildMember,
  APIGuildScheduledEvent,
  APIIncidentsData,
  APIRole,
  APIStageInstance,
  APISticker,
  APIThreadChannel,
  GatewayPresenceUpdate,
  GatewayVoiceState,
  GuildFeature,
  Snowflake,
} from "discord-api-types/v10";

export interface GuildPatch {
  id?: Snowflake;
  name?: string;
  icon?: string | null;
  features?: GuildFeature[];
  unavailable?: boolean;
  discovery_splash?: string | null;
  member_count?: number;
  large?: boolean;
  premium_progress_bar_enabled?: boolean;
  application_id?: Snowflake | null;
  afk_timeout?: number;
  afk_channel_id?: Snowflake | null;
  system_channel_id?: Snowflake | null;
  premium_tier?: number;
  widget_enabled?: boolean | null;
  widget_channel_id?: Snowflake | null;
  explicit_content_filter?: number;
  mfa_level?: number;
  joined_at?: string;
  default_message_notifications?: number;
  system_channel_flags?: number;
  max_members?: number | null;
  max_presences?: number | null;
  max_video_channel_users?: number | null;
  max_stage_video_channel_users?: number | null;
  approximate_member_count?: number | null;
  approximate_presence_count?: number | null;
  rules_channel_id?: Snowflake | null;
  public_updates_channel_id?: Snowflake | null;
  preferred_locale?: string;
  safety_alerts_channel_id?: Snowflake | null;
  channels?: APIGuildChannel[];
  threads?: APIThreadChannel[];
  roles?: APIRole[];
  members?: APIGuildMember[];
  presences?: GatewayPresenceUpdate[];
  stage_instances?: APIStageInstance[];
  guild_scheduled_events?: APIGuildScheduledEvent[];
  voice_states?: GatewayVoiceState[];
  emojis?: APIEmoji[];
  stickers?: APISticker[];
  owner_id?: Snowflake;
  incidents_data?: APIIncidentsData | null;
  shardId?: number;
}
