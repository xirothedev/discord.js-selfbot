import { Collection } from "@discordjs/collection";
import BaseManager from "./BaseManager";
import _DJSErrorModule from "../errors/DJSError";

const { TypeError } = _DJSErrorModule;
import _PresenceModule from "../structures/Presence";

const { CustomStatus } = _PresenceModule;
import _ConstantsModule from "../util/Constants";

const { ActivityTypes } = _ConstantsModule;
import type {
  RawUserSettingsData,
  CustomStatusOption,
  GuildResolvable,
  ActivityOptions,
} from "../../typings";
import type { Client } from "../client/Client";
import type { Guild } from "../structures/Guild";

type CustomStatusOptionSource = CustomStatusOption & { expires?: number };
type CustomStatusJSON = ActivityOptions & {
  emoji?: { id?: string | null; name?: string | null } | null;
};

interface CustomStatusData {
  text?: string | null;
  emoji_name?: string | null;
  emoji_id?: string | null;
  expires_at?: string | null;
}

type UserSettingsPatch = Omit<Partial<RawUserSettingsData>, "custom_status"> & {
  custom_status?: CustomStatusData | null;
};

const SIMPLE_SETTINGS: Record<string, string> = {
  afk_timeout: "afkTimeout",
  animate_emoji: "animatedEmoji",
  animate_stickers: "stickerAnimationMode",
  convert_emoticons: "convertEmoticons",
  default_guilds_restricted: "allowDMsFromGuild",
  developer_mode: "developerMode",
  enable_tts_command: "allowTTS",
  explicit_content_filter: "DMScanLevel",
  gif_auto_play: "autoplayGIF",
  inline_attachment_media: "displayImage",
  inline_embed_media: "linkedImageDisplay",
  locale: "locale",
  message_display_compact: "compactMode",
  render_embeds: "previewLink",
  render_reactions: "showEmojiReactions",
  show_current_game: "activityDisplay",
  theme: "theme",
};

function applySimpleSettings(
  manager: object,
  data: Partial<RawUserSettingsData>
): void {
  for (const [sourceKey, targetKey] of Object.entries(SIMPLE_SETTINGS)) {
    if (sourceKey in data) {
      Reflect.set(manager, targetKey, Reflect.get(data, sourceKey));
    }
  }
}

class ClientUserSettingManager extends BaseManager {
  #rawSetting = {};
  declare addFriendFrom: {
    all: boolean | null;
    mutual_friends: boolean | null;
    mutual_guilds: boolean | null;
  };
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
  declare disableDMfromGuilds: Collection<string, Guild | undefined>;
  declare disableDMfromServer: Collection<string, Guild | undefined>;
  constructor(client: Client) {
    super(client);
    this.addFriendFrom = {
      all: null,
      mutual_friends: null,
      mutual_guilds: null,
    };
  }
  _patch(data: Partial<RawUserSettingsData> = {}) {
    this.#rawSetting = Object.assign(this.#rawSetting, data);
    this.client.emit("debug", `[SETTING > ClientUser] Sync setting`);
    applySimpleSettings(this, data);
    if ("status" in data) {
      this.client.presence.status = data.status ?? "offline";
      if (!("custom_status" in data)) {
        this.client.emit("debug", "[SETTING > ClientUser] Sync status");
        if (typeof data.status === "string") {
          this.client.user?.setStatus(data.status);
        }
      }
    }
    if ("custom_status" in data) {
      this.customStatus = data.custom_status ?? null;
      const activities = this.client.presence.activities.filter(
        (activity) => ![ActivityTypes.CUSTOM, "CUSTOM"].includes(activity.type)
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
        if (emoji) {
          custom.setEmoji(emoji);
        }
        activities.push(custom);
      }
      this.client.emit(
        "debug",
        "[SETTING > ClientUser] Sync activities & status"
      );
      this.client.user?.setPresence({ activities });
    }
    if ("friend_source_flags" in data) {
      // Not implemented yet.
    }
    if ("restricted_guilds" in data) {
      this.disableDMfromGuilds = new Collection(
        (data.restricted_guilds ?? []).map((guildId) => [
          guildId,
          this.client.guilds.cache.get(guildId),
        ])
      );
    }
  }

  get raw() {
    return this.#rawSetting;
  }

  async fetch() {
    const data = await this.client.api
      .users("@me")
      .settings.get<RawUserSettingsData>();
    this._patch(data);
    return this;
  }

  async edit(data: UserSettingsPatch) {
    const res = await this.client.api
      .users("@me")
      .settings.patch<RawUserSettingsData>({ data });
    this._patch(res);
    return this;
  }

  toggleCompactMode() {
    return this.edit({ message_display_compact: !this.compactMode });
  }
  setTheme(value: "dark" | "light") {
    const validValues = ["dark", "light"];
    if (!validValues.includes(value)) {
      throw new TypeError("INVALID_TYPE", "value", "dark | light", true);
    }
    return this.edit({ theme: value });
  }

  setCustomStatus(
    options?: CustomStatusOptionSource | InstanceType<typeof CustomStatus>
  ) {
    if (typeof options !== "object" || options === null) {
      return this.edit({ custom_status: null });
    } else if (options instanceof CustomStatus) {
      const status: CustomStatusJSON = options.toJSON();
      const data: CustomStatusData = {
        emoji_name: null,
        expires_at: null,
        text: null,
      };
      if (typeof status.state === "string") {
        data.text = status.state;
      }
      if (status.emoji) {
        if (status.emoji.id) {
          data.emoji_name = status.emoji.name ?? null;
          data.emoji_id = status.emoji.id;
        } else {
          data.emoji_name =
            typeof status.emoji.name === "string" ? status.emoji.name : null;
        }
      }
      return this.edit({ custom_status: data });
    }
    const data: CustomStatusData = {
      emoji_name: null,
      expires_at: null,
      text: null,
    };
    if (typeof options.text === "string") {
      if (options.text.length > 128) {
        throw new RangeError(
          "[INVALID_VALUE] Custom status text must be less than 128 characters"
        );
      }
      data.text = options.text;
    }
    if (options.emoji) {
      const emoji = this.client.emojis.resolve(options.emoji);
      if (emoji) {
        data.emoji_name = emoji.name;
        data.emoji_id = emoji.id;
      } else {
        data.emoji_name =
          typeof options.emoji === "string" ? options.emoji : null;
      }
    }
    if (typeof options.expires === "number") {
      if (options.expires < Date.now()) {
        throw new RangeError(
          `[INVALID_VALUE] Custom status expiration must be greater than ${Date.now()}`
        );
      }
      data.expires_at = new Date(options.expires).toISOString();
    }
    if (
      typeof options.status === "string" &&
      ["online", "idle", "dnd", "invisible"].includes(options.status)
    ) {
      this.edit({ status: options.status });
    }
    return this.edit({ custom_status: data });
  }

  restrictedGuilds(status: boolean) {
    if (typeof status !== "boolean") {
      throw new TypeError("INVALID_TYPE", "status", "boolean", true);
    }
    return this.edit({
      default_guilds_restricted: status,
      restricted_guilds: status
        ? this.client.guilds.cache.map((guild) => guild.id)
        : [],
    });
  }
  addRestrictedGuild(guildId: GuildResolvable) {
    const id = this.client.guilds.resolveId(guildId);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "guildId", "GuildResolvable");
    }
    const temp = [...this.disableDMfromServer.keys()];
    if (temp.includes(id)) {
      throw new Error("Guild is already restricted");
    }
    temp.push(id);
    return this.edit({ restricted_guilds: temp });
  }

  removeRestrictedGuild(guildId: GuildResolvable) {
    const id = this.client.guilds.resolveId(guildId);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "guildId", "GuildResolvable");
    }
    if (!this.disableDMfromServer.delete(id)) {
      throw new Error("Guild is already restricted");
    }
    return this.edit({
      restricted_guilds: [...this.disableDMfromServer.keys()],
    });
  }
}

export default ClientUserSettingManager;
export { ClientUserSettingManager };
