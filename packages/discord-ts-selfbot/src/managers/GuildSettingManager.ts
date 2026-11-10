import BaseManager from './BaseManager';
import type { RawGuildSettingsData } from '../../typings';
import type { Guild } from '../structures/Guild';
class GuildSettingManager extends BaseManager {
  #rawSetting: Partial<RawGuildSettingsData> = {};
  declare guildId: import('discord-api-types/v10').Snowflake;
  declare suppressEveryone?: boolean;
  declare suppressRoles?: boolean;
  declare muteScheduledEvents?: boolean;
  declare messageNotifications?: number;
  declare flags?: number;
  declare mobilePush?: boolean;
  declare muted?: boolean;
  declare muteConfig?: { endTime: Date; selectedTimeWindow: number } | null;
  declare hideMutedChannels?: boolean;
  declare channelOverrides?: object[];
  declare notifyHighlights?: number;
  declare version?: number;
  constructor(guild: Guild) {
    super(guild.client);
    this.guildId = guild.id;
  }

  get raw() {
    return this.#rawSetting;
  }

  get guild() {
    return this.client.guilds.cache.get(this.guildId);
  }

  _patch(data: Partial<RawGuildSettingsData> = {}) {
    this.#rawSetting = Object.assign(this.#rawSetting, data);
    this.client.emit('debug', `[SETTING > Guild ${this.guildId}] Sync setting`);
    if ('suppress_everyone' in data) {
      this.suppressEveryone = data.suppress_everyone;
    }
    if ('suppress_roles' in data) {
      this.suppressRoles = data.suppress_roles;
    }
    if ('mute_scheduled_events' in data) {
      this.muteScheduledEvents = data.mute_scheduled_events;
    }
    if ('message_notifications' in data) {
      this.messageNotifications = data.message_notifications;
    }
    if ('flags' in data) {
      this.flags = data.flags;
    }
    if ('mobile_push' in data) {
      this.mobilePush = data.mobile_push;
    }
    if ('muted' in data) {
      this.muted = data.muted;
    }
    if ('mute_config' in data && data.mute_config !== null) {
      if (data.mute_config) {
        this.muteConfig = {
          endTime: new Date(data.mute_config.end_time),
          selectedTimeWindow: data.mute_config.selected_time_window,
        };
      }
    } else {
      this.muteConfig = null;
    }
    if ('hide_muted_channels' in data) {
      this.hideMutedChannels = data.hide_muted_channels;
    }
    if ('channel_overrides' in data) {
      this.channelOverrides = data.channel_overrides ?? [];
    }
    if ('notify_highlights' in data) {
      this.notifyHighlights = data.notify_highlights;
    }
    if ('version' in data) {
      this.version = data.version;
    }
  }
  async edit(data: Partial<RawGuildSettingsData>) {
    const data_ = await this.client.api.users('@me').guilds(this.guildId).settings.patch<RawGuildSettingsData>({
      data,
    });
    this._patch(data_);
    return this;
  }
}

export default GuildSettingManager;
export { GuildSettingManager };
