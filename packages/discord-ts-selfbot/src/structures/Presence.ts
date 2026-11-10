import { ActivityFlags as APIActivityFlags } from "discord-api-types/v10";
import type { APIPartialEmoji, Snowflake } from "discord-api-types/v10";
import Base from "./Base";
import type {
  RawActivityData,
  RawRichPresenceAssets,
} from "../../typings/rawDataTypes";
import type {
  ActivityOptions,
  ActivityPlatform,
  ActivityType,
  EmojiIdentifierResolvable,
  PresenceStatus,
  RichPresenceMetadata,
  StaticImageURLOptions,
} from "../../typings";
import type { Guild } from "./Guild";
import type { Client } from "../client/Client";
import ActivityFlags from "../util/ActivityFlags";
import _ConstantsModule from "../util/Constants";

const { ActivityTypes } = _ConstantsModule;
import Util from "../util/Util";
import type User from "./User";
import type { GuildMember } from "./GuildMember";

const NESTED_ARRAY_FLAT_DEPTH = 2;

interface PresencePatch {
  status?: PresenceStatus;
  activities?: Partial<RawActivityData>[];
  client_status?: Partial<Record<"web" | "mobile" | "desktop", string>> | null;
  last_modified?: number;
  afk?: boolean;
  since?: number;
  user?: { id?: string | null };
  guild?: Guild | null;
}

class Presence extends Base {
  declare userId: Snowflake;
  declare guild: Guild | null;
  declare status: PresenceStatus;
  declare activities: (Activity | CustomStatus | RichPresence | SpotifyRPC)[];
  declare clientStatus: Record<string, string> | null;
  declare lastModified: number | null;
  declare afk: boolean;
  declare since: number;

  constructor(client: Client, data?: PresencePatch) {
    super(client);

    const source = data ?? { user: { id: "" } };

    this.userId = source.user?.id ?? "";

    this.guild = source.guild ?? null;

    this._patch(source);
  }

  get user(): User | null {
    return this.client.users.resolve(this.userId);
  }

  get member(): GuildMember | null {
    return this.guild?.members.resolve(this.userId) ?? null;
  }

  _patch(data: PresencePatch) {
    if (typeof data.status === "string") {
      this.status = data.status;
    } else {
      this.status ??= "offline";
    }

    if (data.activities) {
      this.activities = data.activities.map((activity) => {
        if (this.userId === this.client.user?.id) {
          if (
            activity.type !== undefined &&
            [ActivityTypes.CUSTOM, "CUSTOM"].includes(activity.type)
          ) {
            return new CustomStatus(this.client, activity);
          } else if (activity.id === "spotify:1") {
            return new SpotifyRPC(this.client, activity);
          }
          return new RichPresence(this.client, activity);
        }
        return new Activity(this, activity);
      });
    } else {
      this.activities ??= [];
    }

    if ("client_status" in data) {
      if (data.client_status) {
        const clientStatus: Record<string, string> = {};
        for (const key of ["web", "mobile", "desktop"] as const) {
          const value = data.client_status[key];
          if (value) {
            clientStatus[key] = value;
          }
        }
        this.clientStatus = Object.keys(clientStatus).length
          ? clientStatus
          : null;
      } else {
        this.clientStatus = null;
      }
    } else {
      this.clientStatus ??= null;
    }

    if ("last_modified" in data && typeof data.last_modified === "number") {
      this.lastModified = data.last_modified;
    }

    if ("afk" in data && typeof data.afk === "boolean") {
      this.afk = data.afk;
    } else {
      this.afk ??= false;
    }

    if ("since" in data && typeof data.since === "number") {
      this.since = data.since;
    } else {
      this.since ??= 0;
    }

    return this;
  }

  _clone() {
    const clone = Object.assign(Object.create(this), this);
    clone.activities = this.activities.map((activity) => activity._clone());
    return clone;
  }

  equals(presence: Presence) {
    return (
      this === presence ||
      (presence &&
        this.status === presence.status &&
        this.clientStatus?.web === presence.clientStatus?.web &&
        this.clientStatus?.mobile === presence.clientStatus?.mobile &&
        this.clientStatus?.desktop === presence.clientStatus?.desktop &&
        this.activities.length === presence.activities.length &&
        this.activities.every((activity, index) =>
          activity.equals(presence.activities[index])
        ))
    );
  }

  toJSON() {
    return Util.flatten(this);
  }
}

type ActivityPatch = Partial<RawActivityData> & {
  createdTimestamp?: number;
  applicationId?: Snowflake;
  syncId?: string;
};

interface RichPresenceAssetData extends Partial<RawRichPresenceAssets> {
  largeText?: string | null;
  smallText?: string | null;
  largeImage?: Snowflake | null;
  smallImage?: Snowflake | null;
}

interface CustomStatusOptions {
  state?: string;
  emoji?: EmojiIdentifierResolvable;
}

type RichPresenceData = Partial<RawActivityData> & {
  metadata?: RichPresenceMetadata;
};

interface RichParty {
  id?: string;
  max: number;
  current: number;
}

interface RichButton {
  name: string;
  url: string;
}

interface ExternalAssets {
  url?: string | null;
  external_asset_path?: string | null;
}

type SpotifyRPCOptions = RichPresenceData;

function isActivityPlatform(
  value: string | undefined
): value is ActivityPlatform {
  return (
    value === "desktop" ||
    value === "samsung" ||
    value === "xbox" ||
    value === "ios" ||
    value === "android" ||
    value === "embedded" ||
    value === "ps4" ||
    value === "ps5"
  );
}

function resolvePresence(client: Client | Presence | Activity): Presence {
  return "presence" in client ? client.presence : client;
}

function resolvePresenceUserId(client: Client | Presence | Activity): string {
  const { user } = resolvePresence(client).client;
  if (!user) {
    throw new TypeError(
      "A client user is required to create a SpotifyRPC activity"
    );
  }
  return user.id;
}

class Activity {
  declare readonly presence: Presence;
  declare applicationId: Snowflake | null;
  declare assets: RichPresenceAssets;
  declare buttons: string[];
  declare createdTimestamp: number;
  declare details: string | null;
  declare emoji: APIPartialEmoji | null;
  declare flags: Readonly<ActivityFlags>;
  declare id: string;
  declare name: string;
  declare party: { id: string | null; size: [number, number] } | null;
  declare platform: ActivityPlatform | null;
  declare sessionId: string | null;
  declare state: string | null;
  declare syncId: string | null;
  declare timestamps: { start: number | null; end: number | null } | null;
  declare type: ActivityType;
  declare url: string | null;

  constructor(presence: Presence, data: Partial<RawActivityData>) {
    if (!(presence instanceof Presence)) {
      throw new Error(
        "Class constructor Activity cannot be invoked without 'presence'"
      );
    }
    Object.defineProperty(this, "presence", { value: presence });

    this._patch(data);
  }

  _patch(data: ActivityPatch) {
    this._patchIdentity(data);
    this._patchTimestamps(data);
    this._patchDetails(data);
    this._patchPresentation(data);
  }

  private _patchIdentity(data: ActivityPatch) {
    if (typeof data.id === "string") {
      this.id = data.id;
    }

    if (typeof data.name === "string") {
      this.name = data.name;
    }

    if ("type" in data && data.type !== undefined) {
      this.type =
        typeof data.type === "number" ? ActivityTypes[data.type] : data.type;
    }

    this.url = data.url ?? null;

    if (data.created_at !== undefined || data.createdTimestamp !== undefined) {
      this.createdTimestamp = data.created_at ?? data.createdTimestamp ?? 0;
    }

    this.sessionId =
      "session_id" in data
        ? (data.session_id ?? null)
        : (this.presence.client?.sessionId ?? null);

    this.platform = isActivityPlatform(data.platform) ? data.platform : null;
  }

  private _patchTimestamps(data: ActivityPatch) {
    this.timestamps = data.timestamps
      ? {
          end: data.timestamps.end
            ? new Date(data.timestamps.end).getTime()
            : null,
          start: data.timestamps.start
            ? new Date(data.timestamps.start).getTime()
            : null,
        }
      : null;
  }

  private _patchDetails(data: ActivityPatch) {
    this.applicationId = data.application_id ?? data.applicationId ?? null;
    this.details = data.details ?? null;
    this.state = data.state ?? null;
    this.syncId = data.sync_id ?? data.syncId ?? null;
  }

  private _patchPresentation(data: ActivityPatch) {
    this.flags =
      "flags" in data
        ? new ActivityFlags(data.flags).freeze()
        : new ActivityFlags().freeze();

    this.buttons =
      data.buttons?.map((button) =>
        typeof button === "string" ? button : button.label
      ) ?? [];

    this.emoji = data.emoji ? Util.resolvePartialEmoji(data.emoji) : null;

    this.party = data.party
      ? { id: data.party.id ?? null, size: data.party.size ?? [0, 0] }
      : null;

    this.assets = new RichPresenceAssets(this, data.assets);
  }

  equals(activity: Activity) {
    return (
      this === activity ||
      (activity &&
        this.name === activity.name &&
        this.type === activity.type &&
        this.url === activity.url &&
        this.state === activity.state &&
        this.details === activity.details &&
        this.emoji?.id === activity.emoji?.id &&
        this.emoji?.name === activity.emoji?.name)
    );
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  toString() {
    return this.name;
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  toJSON(...props: unknown[]): ActivityOptions {
    return {
      ...Util.flatten(this, ...props),
      name: this.name,
      type: this.type,
    };
  }
}

class RichPresenceAssets {
  declare activity: Activity;
  declare largeImage: Snowflake | null;
  declare largeText: string | null;
  declare smallImage: Snowflake | null;
  declare smallText: string | null;

  constructor(activity: Activity, assets: RichPresenceAssetData | undefined) {
    Object.defineProperty(this, "activity", { value: activity });

    this._patch(assets);
  }

  _patch(assets: RichPresenceAssetData = {}) {
    this.largeText =
      "large_text" in assets || "largeText" in assets
        ? (assets.large_text ?? assets.largeText ?? null)
        : null;

    this.smallText =
      "small_text" in assets || "smallText" in assets
        ? (assets.small_text ?? assets.smallText ?? null)
        : null;

    this.largeImage =
      "large_image" in assets || "largeImage" in assets
        ? (assets.large_image ?? assets.largeImage ?? null)
        : null;

    this.smallImage =
      "small_image" in assets || "smallImage" in assets
        ? (assets.small_image ?? assets.smallImage ?? null)
        : null;
  }

  smallImageURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.smallImage) {
      return null;
    }
    if (this.smallImage.includes(":")) {
      const [platform, id] = this.smallImage.split(":");
      switch (platform) {
        case "mp": {
          return `https://media.discordapp.net/${id}`;
        }
        case "spotify": {
          return `https://i.scdn.co/image/${id}`;
        }
        case "youtube": {
          return `https://i.ytimg.com/vi/${id}/hqdefault_live.jpg`;
        }
        case "twitch": {
          return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${id}.png`;
        }
        default: {
          return null;
        }
      }
    }

    const { applicationId } = this.activity;
    if (!applicationId) {
      return null;
    }

    return this.activity.presence.client.rest.cdn.AppAsset(
      applicationId,
      this.smallImage,
      {
        format,
        size,
      }
    );
  }

  largeImageURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.largeImage) {
      return null;
    }
    if (this.largeImage.includes(":")) {
      const [platform, id] = this.largeImage.split(":");
      switch (platform) {
        case "mp": {
          return `https://media.discordapp.net/${id}`;
        }
        case "spotify": {
          return `https://i.scdn.co/image/${id}`;
        }
        case "youtube": {
          return `https://i.ytimg.com/vi/${id}/hqdefault_live.jpg`;
        }
        case "twitch": {
          return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${id}.png`;
        }
        default: {
          return null;
        }
      }
    }

    const { applicationId } = this.activity;
    if (!applicationId) {
      return null;
    }

    return this.activity.presence.client.rest.cdn.AppAsset(
      applicationId,
      this.largeImage,
      {
        format,
        size,
      }
    );
  }

  static parseImage(image: string | null) {
    if (typeof image !== "string") {
      return null;
    }
    const current = image;
    let parsed = image;
    if (
      URL.canParse(image) &&
      ["http:", "https:"].includes(new URL(image).protocol)
    ) {
      // Discord URL:
      parsed = parsed
        .replace("https://cdn.discordapp.com/", "mp:")
        .replace("http://cdn.discordapp.com/", "mp:")
        .replace("https://media.discordapp.net/", "mp:")
        .replace("http://media.discordapp.net/", "mp:");
      //
      if (!parsed.startsWith("mp:")) {
        throw new Error("INVALID_URL");
      }
    } else if (/^[0-9]{17,19}$/u.test(parsed)) {
      // ID Assets
    } else if (
      ["mp:", "youtube:", "spotify:", "twitch:"].some((prefix) =>
        current.startsWith(prefix)
      )
    ) {
      // Image
    } else if (parsed.startsWith("external/")) {
      parsed = `mp:${parsed}`;
    }
    return parsed;
  }

  toJSON() {
    if (
      !this.largeImage &&
      !this.largeText &&
      !this.smallImage &&
      !this.smallText
    ) {
      return null;
    }
    return {
      large_image: RichPresenceAssets.parseImage(this.largeImage),
      large_text: this.largeText,
      small_image: RichPresenceAssets.parseImage(this.smallImage),
      small_text: this.smallText,
    };
  }

  setLargeImage(image?: string) {
    this.largeImage = RichPresenceAssets.parseImage(image ?? null);
    return this;
  }

  setSmallImage(image?: string) {
    this.smallImage = RichPresenceAssets.parseImage(image ?? null);
    return this;
  }

  setLargeText(text: string) {
    this.largeText = text;
    return this;
  }

  setSmallText(text: string) {
    this.smallText = text;
    return this;
  }
}

class CustomStatus extends Activity {
  constructor(
    client: Client | Presence | Activity,
    data: Partial<RawActivityData> | CustomStatusOptions = {}
  ) {
    if (!client) {
      throw new Error(
        "Class constructor CustomStatus cannot be invoked without 'client'"
      );
    }
    const { emoji, ...rest } = data;
    const raw: RawActivityData = {
      ...rest,
      created_at:
        "created_at" in data && typeof data.created_at === "number"
          ? data.created_at
          : Date.now(),
      id: "id" in data && typeof data.id === "string" ? data.id : "",
      name: " ",
      type: ActivityTypes.CUSTOM,
      ...(emoji ? { emoji: Util.resolvePartialEmoji(emoji) ?? undefined } : {}),
    };
    super(resolvePresence(client), raw);
  }

  setEmoji(emoji: unknown) {
    this.emoji = Util.resolvePartialEmoji(emoji);
    return this;
  }

  setState(state: string | null) {
    if (typeof state === "string" && state.length > 128) {
      throw new Error("State must be less than 128 characters");
    }
    this.state = state;
    return this;
  }

  override toJSON(): ActivityOptions {
    if (!this.emoji && !this.state) {
      throw new Error("CustomStatus must have at least one of emoji or state");
    }
    return {
      name: this.name,
      state: this.state,
      type: "CUSTOM",
      ...(this.emoji ? { emoji: this.emoji } : {}),
    };
  }
}

class RichPresence extends Activity {
  declare metadata: RichPresenceMetadata;
  declare secrets: Record<string, string>;
  constructor(
    client: Client | Presence | Activity,
    data: RichPresenceData = {}
  ) {
    if (!client) {
      throw new Error(
        "Class constructor RichPresence cannot be invoked without 'client'"
      );
    }
    const raw: RawActivityData = Object.assign(
      {
        created_at: data.created_at ?? Date.now(),
        id: data.id ?? "",
        name: " ",
        type: 0,
      },
      data
    );
    super(resolvePresence(client), raw);
    this.setup(data);
  }

  setup(data: RichPresenceData = {}) {
    const secrets: Record<string, string> = {};
    for (const [key, value] of Object.entries(data.secrets ?? {})) {
      if (typeof value === "string") {
        secrets[key] = value;
      }
    }
    this.secrets = secrets;
    this.metadata = data.metadata ?? {};
  }

  setAssetsLargeImage(image: string) {
    this.assets.setLargeImage(image);
    return this;
  }

  setAssetsSmallImage(image: string) {
    this.assets.setSmallImage(image);
    return this;
  }

  setAssetsLargeText(text: string) {
    this.assets.setLargeText(text);
    return this;
  }

  setAssetsSmallText(text: string) {
    this.assets.setSmallText(text);
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setURL(url: string | null) {
    if (typeof url === "string" && !URL.canParse(url)) {
      throw new Error("URL must be a valid URL");
    }
    this.url = url;
    return this;
  }

  setType(type: ActivityType | number) {
    this.type =
      typeof type === "number" ? (ActivityTypes[type] ?? this.type) : type;
    return this;
  }

  setApplicationId(id: Snowflake | null) {
    this.applicationId = id;
    return this;
  }

  setState(state: string | null) {
    this.state = state;
    return this;
  }

  setDetails(details: string | null) {
    this.details = details;
    return this;
  }

  setParty(party: RichParty | null) {
    if (party) {
      if (!party.max || typeof party.max !== "number") {
        throw new Error("Party must have max number");
      }
      if (!party.current || typeof party.current !== "number") {
        throw new Error("Party must have current");
      }
      if (party.current > party.max) {
        throw new Error("Party current must be less than max number");
      }
      if (!party.id || typeof party.id !== "string") {
        party.id = crypto.randomUUID();
      }
      this.party = {
        id: party.id,
        size: [party.current, party.max],
      };
    } else {
      this.party = null;
    }
    return this;
  }

  setStartTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) {
      this.timestamps = { end: null, start: null };
    }
    this.timestamps.start =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  setEndTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) {
      this.timestamps = { end: null, start: null };
    }
    this.timestamps.end =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  setButtons(...button: (RichButton | RichButton[])[]) {
    if (button.length === 0) {
      this.buttons = [];
      delete this.metadata.button_urls;
      return this;
    } else if (button.length > 2) {
      throw new Error("RichPresence can only have up to 2 buttons");
    }

    this.buttons = [];
    const buttonUrls: string[] = [];
    this.metadata = { ...this.metadata, button_urls: buttonUrls };

    for (const buttonItem of button.flat(NESTED_ARRAY_FLAT_DEPTH)) {
      if (buttonItem.name && buttonItem.url) {
        this.buttons.push(buttonItem.name);
        if (!URL.canParse(buttonItem.url)) {
          throw new Error("Button url must be a valid url");
        }
        buttonUrls.push(buttonItem.url);
      } else {
        throw new Error("Button must have name and url");
      }
    }
    return this;
  }

  setPlatform(platform: ActivityPlatform | null) {
    this.platform = platform;
    return this;
  }

  setJoinSecret(join: string | null) {
    if (join) {
      this.secrets.join = join;
    } else {
      delete this.secrets.join;
    }
    return this;
  }

  addButton(name: string, url: string) {
    if (!name || !url) {
      throw new Error("Button must have name and url");
    }
    if (typeof name !== "string") {
      throw new TypeError("Button name must be a string");
    }
    if (!URL.canParse(url)) {
      throw new Error("Button url must be a valid url");
    }
    this.buttons.push(name);
    if (Array.isArray(this.metadata.button_urls)) {
      this.metadata.button_urls.push(url);
    } else {
      this.metadata.button_urls = [url];
    }
    return this;
  }

  override toJSON(...props: unknown[]) {
    return super.toJSON(
      {
        applicationId: "application_id",
        createdTimestamp: "created_at",
        sessionId: "session_id",
        syncId: "sync_id",
      },
      ...props
    );
  }

  static async getExternal(
    client: Client,
    applicationId: Snowflake,
    ...images: string[]
  ): Promise<ExternalAssets[]> {
    if (!client || !client.token || !client.api) {
      throw new Error("Client must be set");
    }
    // Check if applicationId is discord snowflake (17 , 18, 19 numbers)
    if (!/^[0-9]{17,19}$/u.test(applicationId)) {
      throw new Error("Application id must be a Discord Snowflake");
    }
    // Check if images are 1 or 2
    if (images.length > 2) {
      throw new Error("RichPresence can only have up to 2 external images");
    }
    // Check if all images are valid URLs
    if (images.some((image) => !URL.canParse(image))) {
      throw new Error("Each image must be a valid URL.");
    }
    const res = await client.api.applications[applicationId][
      "external-assets"
    ].post<ExternalAssets[]>({
      data: {
        urls: images,
      },
    });
    return res;
  }

  override toString() {
    return this.name;
  }

  override _clone() {
    return Object.assign(Object.create(this), this);
  }
}

class SpotifyRPC extends RichPresence {
  constructor(
    client: Client | Presence | Activity,
    options: SpotifyRPCOptions = {}
  ) {
    if (!client) {
      throw new Error(
        "Class constructor SpotifyRPC cannot be invoked without 'client'"
      );
    }
    super(client, {
      flags: APIActivityFlags.Sync | APIActivityFlags.Play,
      id: "spotify:1",
      name: "Spotify",
      party: {
        id: `spotify:${resolvePresenceUserId(client)}`,
      },
      type: ActivityTypes.LISTENING,
      ...options,
    });
    this.setup(options);
  }
  override setup(options: SpotifyRPCOptions) {
    const metadata: RichPresenceMetadata = {
      album_id: options.metadata?.album_id || undefined,
      artist_ids: options.metadata?.artist_ids || [],
      context_uri: options.metadata?.context_uri || undefined,
    };
    this.metadata = metadata;
  }

  setSongId(id: string) {
    this.syncId = id;
    return this;
  }

  addArtistId(id: string) {
    const artistIds = this.metadata.artist_ids ?? [];
    artistIds.push(id);
    this.metadata = { ...this.metadata, artist_ids: artistIds };
    return this;
  }

  setArtistIds(...ids: (string | string[])[]) {
    const artistIds = ids?.length ? (this.metadata.artist_ids ?? []) : [];
    for (const id of ids.flat(NESTED_ARRAY_FLAT_DEPTH)) {
      artistIds.push(id);
    }
    this.metadata = { ...this.metadata, artist_ids: artistIds };
    return this;
  }

  setAlbumId(id: string) {
    this.metadata = {
      ...this.metadata,
      album_id: id,
      context_uri: `spotify:album:${id}`,
    };
    return this;
  }

  override toJSON() {
    return super.toJSON({
      buttons: false,
      emoji: false,
      id: false,
      platform: false,
    });
  }
}

export {
  Presence,
  Activity,
  RichPresenceAssets,
  CustomStatus,
  RichPresence,
  SpotifyRPC,
};
export default {
  Activity,
  CustomStatus,
  Presence,
  RichPresence,
  RichPresenceAssets,
  SpotifyRPC,
};
