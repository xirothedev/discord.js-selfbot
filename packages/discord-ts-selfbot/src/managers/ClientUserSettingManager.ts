import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import _DJSErrorModule from '../errors/DJSError';
const { TypeError } = _DJSErrorModule;
import _PresenceModule from '../structures/Presence';
const { CustomStatus } = _PresenceModule;
import _ConstantsModule from '../util/Constants';
const { ActivityTypes } = _ConstantsModule;
import type { RawUserSettingsData, CustomStatusOption, GuildResolvable } from '../../typings';
import type { Client } from '../client/Client';
import type { ActivityOptions } from '../../typings';

type CustomStatusOptionSource = CustomStatusOption & { expires?: number };
type CustomStatusJSON = ActivityOptions & { emoji?: { id?: string | null; name?: string | null } | null };

interface CustomStatusData {
  text?: string | null;
  emoji_name?: string | null;
  emoji_id?: string | null;
  expires_at?: string | null;
}

type UserSettingsPatch = Omit<Partial<RawUserSettingsData>, 'custom_status'> & {
  custom_status?: CustomStatusData | null;
};

/**
 * Manages API methods for users and stores their cache.
 * @extends {BaseManager}
 * @see {@link https://luna.gitlab.io/discord-unofficial-docs/user_settings.html}
 */
class ClientUserSettingManager extends BaseManager {
  #rawSetting = {};
  declare addFriendFrom: { all: boolean | null; mutual_friends: boolean | null; mutual_guilds: boolean | null };
  declare locale?: string;
  declare activityDisplay?: boolean;
  declare allowDMsFromGuild?: boolean;
  declare displayImage?: boolean;
  declare linkedImageDisplay?: boolean;
  declare autoplayGIF?: boolean;
  declare previewLink?: boolean;
  declare animatedEmoji?: boolean;
  declare allowTTS?: boolean;
  declare compactMode?: boolean;
  declare convertEmoticons?: boolean;
  declare DMScanLevel?: number;
  declare theme?: string;
  declare developerMode?: boolean;
  declare afkTimeout?: number;
  declare stickerAnimationMode?: number;
  declare showEmojiReactions?: boolean;
  declare customStatus: CustomStatusData | null;
  declare disableDMfromGuilds: Collection<string, import('../structures/Guild').Guild | undefined>;
  declare disableDMfromServer: Collection<string, import('../structures/Guild').Guild | undefined>;
  constructor(client: Client) {
    super(client);
    /**
     * WHO CAN ADD YOU AS A FRIEND ?
     * @type {?object}
     * @see {@link https://luna.gitlab.io/discord-unofficial-docs/user_settings.html#friend-source-flags-structure}
     */
    this.addFriendFrom = {
      all: null,
      mutual_friends: null,
      mutual_guilds: null,
    };
  }
  /**
   * Patch data file
   * https://luna.gitlab.io/discord-unofficial-docs/docs/user_settings
   * @private
   * @param {Object} data Raw Data to patch
   */
  _patch(data: Partial<RawUserSettingsData> = {}) {
    this.#rawSetting = Object.assign(this.#rawSetting, data);
    this.client.emit('debug', `[SETTING > ClientUser] Sync setting`);
    if ('locale' in data) {
      /**
       * The user's chosen language option
       * @type {?string}
       * @see {@link https://discord.com/developers/docs/reference#locales}
       */
      this.locale = data.locale;
    }
    if ('show_current_game' in data) {
      /**
       * Show playing status for detected/added games
       * <info>Setting => ACTIVITY SETTINGS => Activity Status => Display current activity as a status message</info>
       * @type {?boolean}
       */
      this.activityDisplay = data.show_current_game;
    }
    if ('default_guilds_restricted' in data) {
      /**
       * Allow DMs from guild members by default on guild join
       * @type {?boolean}
       */
      this.allowDMsFromGuild = data.default_guilds_restricted;
    }
    if ('inline_attachment_media' in data) {
      /**
       * Display images and video when uploaded directly
       * @type {?boolean}
       */
      this.displayImage = data.inline_attachment_media;
    }
    if ('inline_embed_media' in data) {
      /**
       * Display images and video when linked
       * @type {?boolean}
       */
      this.linkedImageDisplay = data.inline_embed_media;
    }
    if ('gif_auto_play' in data) {
      /**
       * Play GIFs without hovering over them
       * <info>Setting => APP SETTINGS => Accessibility => Automatically play GIFs when Discord is focused.</info>
       * @type {?boolean}
       */
      this.autoplayGIF = data.gif_auto_play;
    }
    if ('render_embeds' in data) {
      /**
       * Show embeds and preview website links pasted into chat
       * @type {?boolean}
       */
      this.previewLink = data.render_embeds;
    }
    if ('animate_emoji' in data) {
      /**
       * Play animated emoji without hovering over them
       * <info>Setting => APP SETTINGS => Accessibility => Play Animated Emojis</info>
       * @type {?boolean}
       */
      this.animatedEmoji = data.animate_emoji;
    }
    if ('enable_tts_command' in data) {
      /**
       * Enable /tts command and playback
       * <info>Setting => APP SETTINGS => Accessibility => Text-to-speech => Allow playback</info>
       * @type {?boolean}
       */
      this.allowTTS = data.enable_tts_command;
    }
    if ('message_display_compact' in data) {
      /**
       * Use compact mode
       * <info>Setting => APP SETTINGS => Appearance => Message Display => Compact Mode</info>
       * @type {?boolean}
       */
      this.compactMode = data.message_display_compact;
    }
    if ('convert_emoticons' in data) {
      /**
       * Convert "old fashioned" emoticons to emojis
       * <info>Setting => APP SETTINGS => Text & Images => Emoji => Convert Emoticons</info>
       * @type {?boolean}
       */
      this.convertEmoticons = data.convert_emoticons;
    }
    if ('explicit_content_filter' in data) {
      /**
       * Content filter level
       * <info>
       * * `0`: Off
       * * `1`: Friends excluded
       * * `2`: Scan everyone
       * </info>
       * @type {?number}
       */
      this.DMScanLevel = data.explicit_content_filter;
    }
    if ('theme' in data) {
      /**
       * Client theme
       * <info>Setting => APP SETTINGS => Appearance => Theme
       * * `dark`
       * * `light`
       * </info>
       * @type {?string}
       */
      this.theme = data.theme;
    }
    if ('developer_mode' in data) {
      /**
       * Show the option to copy ids in right click menus
       * @type {?boolean}
       */
      this.developerMode = data.developer_mode;
    }
    if ('afk_timeout' in data) {
      /**
       * How many seconds being idle before the user is marked as "AFK"; this handles when push notifications are sent
       * @type {?number}
       */
      this.afkTimeout = data.afk_timeout;
    }
    if ('animate_stickers' in data) {
      /**
       * When stickers animate
       * <info>
       * * `0`: Always
       * * `1`: On hover/focus
       * * `2`: Never
       * </info>
       * @type {?number}
       */
      this.stickerAnimationMode = data.animate_stickers;
    }
    if ('render_reactions' in data) {
      /**
       * Display reactions
       * <info>Setting => APP SETTINGS => Text & Images => Emoji => Show emoji reactions</info>
       * @type {?boolean}
       */
      this.showEmojiReactions = data.render_reactions;
    }
    if ('status' in data) {
      this.client.presence.status = data.status ?? 'offline';
      if (!('custom_status' in data)) {
        this.client.emit('debug', '[SETTING > ClientUser] Sync status');
        if (typeof data.status === 'string') this.client.user!.setStatus(data.status);
      }
    }
    if ('custom_status' in data) {
      this.customStatus = data.custom_status ?? null;
      const activities = this.client.presence.activities.filter(
        a => ![ActivityTypes.CUSTOM, 'CUSTOM'].includes(a.type),
      );
      if (data.custom_status) {
        const custom = new CustomStatus(this.client);
        custom.setState(data.custom_status.text ?? null);
        let emoji;
        if (data.custom_status.emoji_id) {
          emoji = this.client.emojis.cache.get(data.custom_status.emoji_id);
        } else if (data.custom_status.emoji_name) {
          emoji = `:${data.custom_status.emoji_name}:`;
        }
        if (emoji) custom.setEmoji(emoji);
        activities.push(custom);
      }
      this.client.emit('debug', '[SETTING > ClientUser] Sync activities & status');
      this.client.user!.setPresence({ activities });
    }
    if ('friend_source_flags' in data) {
      // Todo
    }
    if ('restricted_guilds' in data) {
      /**
       * Disable Direct Message from servers
       * @type {Collection<Snowflake, Guild>}
       */
      this.disableDMfromGuilds = new Collection(
        (data.restricted_guilds ?? []).map(guildId => [guildId, this.client.guilds.cache.get(guildId)]),
      );
    }
  }

  /**
   * Raw data
   * @type {Object}
   */
  get raw() {
    return this.#rawSetting;
  }

  async fetch() {
    const data = await this.client.api.users('@me').settings.get();
    this._patch(data);
    return this;
  }

  /**
   * Edit data
   * @param {any} data Data to edit
   */
  async edit(data: UserSettingsPatch) {
    const res = await this.client.api.users('@me').settings.patch({ data });
    this._patch(res);
    return this;
  }

  /**
   * Toggle compact mode
   * @returns {Promise<this>}
   */
  toggleCompactMode() {
    return this.edit({ message_display_compact: !this.compactMode });
  }
  /**
   * Discord Theme
   * @param {string} value Theme to set (dark | light)
   * @returns {Promise<this>}
   */
  setTheme(value: 'dark' | 'light') {
    const validValues = ['dark', 'light'];
    if (!validValues.includes(value)) {
      throw new TypeError('INVALID_TYPE', 'value', 'dark | light', true);
    }
    return this.edit({ theme: value });
  }

  /**
   * CustomStatus Object
   * @typedef {Object} CustomStatusOption
   * @property {string | null} text Text to set
   * @property {string | null} status The status to set: 'online', 'idle', 'dnd', 'invisible' or null.
   * @property {EmojiResolvable | null} emoji UnicodeEmoji, DiscordEmoji, or null.
   * @property {number | null} expires The number of seconds until the status expires, or null.
   */

  /**
   * Set custom status
   * @param {?CustomStatus | CustomStatusOption} options CustomStatus
   * @returns {Promise<this>}
   */
  setCustomStatus(options?: CustomStatusOptionSource | InstanceType<typeof CustomStatus>) {
    if (typeof options !== 'object' || options === null) {
      return this.edit({ custom_status: null });
    } else if (options instanceof CustomStatus) {
      const status: CustomStatusJSON = options.toJSON();
      const data: CustomStatusData = {
        emoji_name: null,
        expires_at: null,
        text: null,
      };
      if (typeof status.state === 'string') {
        data.text = status.state;
      }
      if (status.emoji) {
        if (status.emoji.id) {
          data.emoji_name = status.emoji.name ?? null;
          data.emoji_id = status.emoji.id;
        } else {
          data.emoji_name = typeof status.emoji.name === 'string' ? status.emoji.name : null;
        }
      }
      return this.edit({ custom_status: data });
    } else {
      const data: CustomStatusData = {
        emoji_name: null,
        expires_at: null,
        text: null,
      };
      if (typeof options.text === 'string') {
        if (options.text.length > 128) {
          throw new RangeError('[INVALID_VALUE] Custom status text must be less than 128 characters');
        }
        data.text = options.text;
      }
      if (options.emoji) {
        const emoji = this.client.emojis.resolve(options.emoji);
        if (emoji) {
          data.emoji_name = emoji.name;
          data.emoji_id = emoji.id;
        } else {
          data.emoji_name = typeof options.emoji === 'string' ? options.emoji : null;
        }
      }
      if (typeof options.expires === 'number') {
        if (options.expires < Date.now()) {
          throw new RangeError(`[INVALID_VALUE] Custom status expiration must be greater than ${Date.now()}`);
        }
        data.expires_at = new Date(options.expires).toISOString();
      }
      if (typeof options.status === 'string' && ['online', 'idle', 'dnd', 'invisible'].includes(options.status)) {
        this.edit({ status: options.status });
      }
      return this.edit({ custom_status: data });
    }
  }

  /**
   * Restricted guilds setting
   * @param {boolean} status Restricted status
   * @returns {Promise}
   */
  restrictedGuilds(status: boolean) {
    if (typeof status !== 'boolean') {
      throw new TypeError('INVALID_TYPE', 'status', 'boolean', true);
    }
    return this.edit({
      default_guilds_restricted: status,
      restricted_guilds: status ? this.client.guilds.cache.map(v => v.id) : [],
    });
  }
  /**
   * Add a guild to the list of restricted guilds.
   * @param {GuildIDResolve} guildId The guild to add
   * @returns {Promise}
   */
  addRestrictedGuild(guildId: GuildResolvable) {
    const id = this.client.guilds.resolveId(guildId);
    if (!id) throw new TypeError('INVALID_TYPE', 'guildId', 'GuildResolvable');
    const temp = [...this.disableDMfromServer.keys()];
    if (temp.includes(id)) throw new Error('Guild is already restricted');
    temp.push(id);
    return this.edit({ restricted_guilds: temp });
  }

  /**
   * Remove a guild from the list of restricted guilds.
   * @param {GuildIDResolve} guildId The guild to remove
   * @returns {Promise}
   */
  removeRestrictedGuild(guildId: GuildResolvable) {
    const id = this.client.guilds.resolveId(guildId);
    if (!id) throw new TypeError('INVALID_TYPE', 'guildId', 'GuildResolvable');
    if (!this.disableDMfromServer.delete(id)) throw new Error('Guild is already restricted');
    return this.edit({ restricted_guilds: [...this.disableDMfromServer.keys()] });
  }
}

export default ClientUserSettingManager;
export { ClientUserSettingManager };
