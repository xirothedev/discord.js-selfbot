import { ActivityFlags as APIActivityFlags } from 'discord-api-types/v10';
import type { APIPartialEmoji, Snowflake } from 'discord-api-types/v10';
import Base from './Base';
import type { RawActivityData, RawRichPresenceAssets } from '../../typings/rawDataTypes';
import type {
  ActivityOptions,
  ActivityPlatform,
  ActivityType,
  EmojiIdentifierResolvable,
  PresenceStatus,
  RichPresenceMetadata,
  StaticImageURLOptions,
} from '../../typings';
import type { Guild } from './Guild';
import type { Client } from '../client/Client';
import ActivityFlags from '../util/ActivityFlags';
import _ConstantsModule from '../util/Constants';
const { ActivityTypes } = _ConstantsModule;
import Util from '../util/Util';

interface PresencePatch {
  status?: PresenceStatus;
  activities?: Partial<RawActivityData>[];
  client_status?: Partial<Record<'web' | 'mobile' | 'desktop', string>> | null;
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

  constructor(client: Client, data: PresencePatch = { user: { id: '' } }) {
    super(client);

    this.userId = data.user?.id ?? '';

    this.guild = data.guild ?? null;

    this._patch(data);
  }

  get user(): import('./User').default | null {
    return this.client.users.resolve(this.userId);
  }

  get member(): import('./GuildMember').GuildMember | null {
    return this.guild?.members.resolve(this.userId) ?? null;
  }

  _patch(data: PresencePatch) {
    if (typeof data.status === 'string') {
      this.status = data.status;
    } else {
      this.status ??= 'offline';
    }

    if (data.activities) {
      this.activities = data.activities.map(activity => {
        if (this.userId === this.client.user?.id) {
          if (activity.type !== undefined && [ActivityTypes.CUSTOM, 'CUSTOM'].includes(activity.type)) {
            return new CustomStatus(this.client, activity);
          } else if (activity.id == 'spotify:1') {
            return new SpotifyRPC(this.client, activity);
          } else {
            return new RichPresence(this.client, activity);
          }
        } else {
          return new Activity(this, activity);
        }
      });
    } else {
      this.activities ??= [];
    }

    if ('client_status' in data) {
      if (data.client_status) {
        const clientStatus: Record<string, string> = {};
        for (const key of ['web', 'mobile', 'desktop'] as const) {
          const value = data.client_status[key];
          if (value) clientStatus[key] = value;
        }
        this.clientStatus = Object.keys(clientStatus).length ? clientStatus : null;
      } else {
        this.clientStatus = null;
      }
    } else {
      this.clientStatus ??= null;
    }

    if ('last_modified' in data && typeof data.last_modified === 'number') {
      this.lastModified = data.last_modified;
    }

    if ('afk' in data && typeof data.afk === 'boolean') {
      this.afk = data.afk;
    } else {
      this.afk ??= false;
    }

    if ('since' in data && typeof data.since === 'number') {
      this.since = data.since;
    } else {
      this.since ??= 0;
    }

    return this;
  }

  _clone() {
    const clone = Object.assign(Object.create(this), this);
    clone.activities = this.activities.map(activity => activity._clone());
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
        this.activities.every((activity, index) => activity.equals(presence.activities[index])))
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

function isActivityPlatform(value: string | undefined): value is ActivityPlatform {
  return (
    value === 'desktop' ||
    value === 'samsung' ||
    value === 'xbox' ||
    value === 'ios' ||
    value === 'android' ||
    value === 'embedded' ||
    value === 'ps4' ||
    value === 'ps5'
  );
}

function resolvePresence(client: Client | Presence | Activity): Presence {
  return 'presence' in client ? client.presence : client;
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
      throw new Error("Class constructor Activity cannot be invoked without 'presence'");
    }
    Object.defineProperty(this, 'presence', { value: presence });

    this._patch(data);
  }

  _patch(data: ActivityPatch) {
    if (typeof data.id === 'string') {
      this.id = data.id;
    }

    if (typeof data.name === 'string') {
      this.name = data.name;
    }

    if ('type' in data && data.type !== undefined) {
      this.type = typeof data.type === 'number' ? ActivityTypes[data.type] : data.type;
    }

    if ('url' in data) {
      this.url = data.url ?? null;
    } else {
      this.url = null;
    }

    if (data.created_at !== undefined || data.createdTimestamp !== undefined) {
      this.createdTimestamp = data.created_at ?? data.createdTimestamp ?? 0;
    }

    if ('session_id' in data) {
      this.sessionId = data.session_id ?? null;
    } else {
      this.sessionId = this.presence.client?.sessionId ?? null;
    }

    if ('platform' in data) {
      this.platform = isActivityPlatform(data.platform) ? data.platform : null;
    } else {
      this.platform = null;
    }

    if ('timestamps' in data && data.timestamps) {
      this.timestamps = {
        start: data.timestamps.start ? new Date(data.timestamps.start).getTime() : null,
        end: data.timestamps.end ? new Date(data.timestamps.end).getTime() : null,
      };
    } else {
      this.timestamps = null;
    }

    if ('application_id' in data || 'applicationId' in data) {
      this.applicationId = data.application_id ?? data.applicationId ?? null;
    } else {
      this.applicationId = null;
    }

    if ('details' in data) {
      this.details = data.details ?? null;
    } else {
      this.details = null;
    }

    if ('state' in data) {
      this.state = data.state ?? null;
    } else {
      this.state = null;
    }

    if ('sync_id' in data || 'syncId' in data) {
      this.syncId = data.sync_id ?? data.syncId ?? null;
    } else {
      this.syncId = null;
    }

    if ('flags' in data) {
      this.flags = new ActivityFlags(data.flags).freeze();
    } else {
      this.flags = new ActivityFlags().freeze();
    }

    if ('buttons' in data) {
      this.buttons = data.buttons?.map(button => (typeof button === 'string' ? button : button.label)) ?? [];
    } else {
      this.buttons = [];
    }

    if ('emoji' in data && data.emoji) {
      this.emoji = Util.resolvePartialEmoji(data.emoji);
    } else {
      this.emoji = null;
    }

    if ('party' in data) {
      this.party = data.party ? { id: data.party.id ?? null, size: data.party.size ?? [0, 0] } : null;
    } else {
      this.party = null;
    }

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
    Object.defineProperty(this, 'activity', { value: activity });

    this._patch(assets);
  }

  _patch(assets: RichPresenceAssetData = {}) {
    if ('large_text' in assets || 'largeText' in assets) {
      this.largeText = assets.large_text ?? assets.largeText ?? null;
    } else {
      this.largeText = null;
    }

    if ('small_text' in assets || 'smallText' in assets) {
      this.smallText = assets.small_text ?? assets.smallText ?? null;
    } else {
      this.smallText = null;
    }

    if ('large_image' in assets || 'largeImage' in assets) {
      this.largeImage = assets.large_image ?? assets.largeImage ?? null;
    } else {
      this.largeImage = null;
    }

    if ('small_image' in assets || 'smallImage' in assets) {
      this.smallImage = assets.small_image ?? assets.smallImage ?? null;
    } else {
      this.smallImage = null;
    }
  }

  smallImageURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.smallImage) return null;
    if (this.smallImage.includes(':')) {
      const [platform, id] = this.smallImage.split(':');
      switch (platform) {
        case 'mp':
          return `https://media.discordapp.net/${id}`;
        case 'spotify':
          return `https://i.scdn.co/image/${id}`;
        case 'youtube':
          return `https://i.ytimg.com/vi/${id}/hqdefault_live.jpg`;
        case 'twitch':
          return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${id}.png`;
        default:
          return null;
      }
    }

    return this.activity.presence.client.rest.cdn.AppAsset(this.activity.applicationId!, this.smallImage, {
      format,
      size,
    });
  }

  largeImageURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.largeImage) return null;
    if (this.largeImage.includes(':')) {
      const [platform, id] = this.largeImage.split(':');
      switch (platform) {
        case 'mp':
          return `https://media.discordapp.net/${id}`;
        case 'spotify':
          return `https://i.scdn.co/image/${id}`;
        case 'youtube':
          return `https://i.ytimg.com/vi/${id}/hqdefault_live.jpg`;
        case 'twitch':
          return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${id}.png`;
        default:
          return null;
      }
    }

    return this.activity.presence.client.rest.cdn.AppAsset(this.activity.applicationId!, this.largeImage, {
      format,
      size,
    });
  }

  static parseImage(image: string | null) {
    if (typeof image !== 'string') return null;
    const current = image;
    if (URL.canParse(image) && ['http:', 'https:'].includes(new URL(image).protocol)) {
      // Discord URL:
      image = image
        .replace('https://cdn.discordapp.com/', 'mp:')
        .replace('http://cdn.discordapp.com/', 'mp:')
        .replace('https://media.discordapp.net/', 'mp:')
        .replace('http://media.discordapp.net/', 'mp:');
      //
      if (!image.startsWith('mp:')) {
        throw new Error('INVALID_URL');
      }
    } else if (/^[0-9]{17,19}$/.test(image)) {
      // ID Assets
    } else if (['mp:', 'youtube:', 'spotify:', 'twitch:'].some(v => current.startsWith(v))) {
      // Image
    } else if (image.startsWith('external/')) {
      image = `mp:${image}`;
    }
    return image;
  }

  toJSON() {
    if (!this.largeImage && !this.largeText && !this.smallImage && !this.smallText) return null;
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
  constructor(client: Client | Presence | Activity, data: Partial<RawActivityData> | CustomStatusOptions = {}) {
    if (!client) throw new Error("Class constructor CustomStatus cannot be invoked without 'client'");
    const { emoji, ...rest } = data;
    const raw: RawActivityData = {
      ...rest,
      id: 'id' in data && typeof data.id === 'string' ? data.id : '',
      name: ' ',
      type: ActivityTypes.CUSTOM,
      created_at: 'created_at' in data && typeof data.created_at === 'number' ? data.created_at : Date.now(),
      ...(emoji ? { emoji: Util.resolvePartialEmoji(emoji) ?? undefined } : {}),
    };
    super(resolvePresence(client), raw);
  }

  setEmoji(emoji: unknown) {
    this.emoji = Util.resolvePartialEmoji(emoji);
    return this;
  }

  setState(state: string | null) {
    if (typeof state == 'string' && state.length > 128) throw new Error('State must be less than 128 characters');
    this.state = state;
    return this;
  }

  override toJSON(): ActivityOptions {
    if (!this.emoji && !this.state) throw new Error('CustomStatus must have at least one of emoji or state');
    return {
      ...{ name: this.name, type: 'CUSTOM', state: this.state },
      ...(this.emoji ? { emoji: this.emoji } : {}),
    };
  }
}

class RichPresence extends Activity {
  declare metadata: RichPresenceMetadata;
  declare secrets: Record<string, string>;
  constructor(client: Client | Presence | Activity, data: RichPresenceData = {}) {
    if (!client) throw new Error("Class constructor RichPresence cannot be invoked without 'client'");
    const raw: RawActivityData = Object.assign(
      {
        id: data.id ?? '',
        name: ' ',
        type: 0,
        created_at: data.created_at ?? Date.now(),
      },
      data,
    );
    super(resolvePresence(client), raw);
    this.setup(data);
  }

  setup(data: RichPresenceData = {}) {
    const secrets: Record<string, string> = {};
    for (const [key, value] of Object.entries(data.secrets ?? {})) {
      if (typeof value === 'string') secrets[key] = value;
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
    if (typeof url == 'string' && !URL.canParse(url)) throw new Error('URL must be a valid URL');
    this.url = url;
    return this;
  }

  setType(type: ActivityType | number) {
    this.type = typeof type == 'number' ? (ActivityTypes[type] ?? this.type) : type;
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
      if (!party.max || typeof party.max != 'number') throw new Error('Party must have max number');
      if (!party.current || typeof party.current != 'number') throw new Error('Party must have current');
      if (party.current > party.max) throw new Error('Party current must be less than max number');
      if (!party.id || typeof party.id != 'string') party.id = crypto.randomUUID();
      this.party = {
        size: [party.current, party.max],
        id: party.id,
      };
    } else {
      this.party = null;
    }
    return this;
  }

  setStartTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) this.timestamps = { start: null, end: null };
    this.timestamps.start = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  setEndTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) this.timestamps = { start: null, end: null };
    this.timestamps.end = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  setButtons(...button: (RichButton | RichButton[])[]) {
    if (button.length == 0) {
      this.buttons = [];
      delete this.metadata.button_urls;
      return this;
    } else if (button.length > 2) {
      throw new Error('RichPresence can only have up to 2 buttons');
    }

    this.buttons = [];
    const buttonUrls: string[] = [];
    this.metadata = { ...this.metadata, button_urls: buttonUrls };

    button.flat(2).forEach(b => {
      if (b.name && b.url) {
        this.buttons.push(b.name);
        if (!URL.canParse(b.url)) throw new Error('Button url must be a valid url');
        buttonUrls.push(b.url);
      } else {
        throw new Error('Button must have name and url');
      }
    });
    return this;
  }

  setPlatform(platform: ActivityPlatform | null) {
    this.platform = platform;
    return this;
  }

  setJoinSecret(join: string | null) {
    if (join) this.secrets.join = join;
    else delete this.secrets.join;
    return this;
  }

  addButton(name: string, url: string) {
    if (!name || !url) {
      throw new Error('Button must have name and url');
    }
    if (typeof name !== 'string') throw new Error('Button name must be a string');
    if (!URL.canParse(url)) throw new Error('Button url must be a valid url');
    this.buttons.push(name);
    if (Array.isArray(this.metadata.button_urls)) this.metadata.button_urls.push(url);
    else this.metadata.button_urls = [url];
    return this;
  }

  override toJSON(...props: unknown[]) {
    return super.toJSON(
      {
        applicationId: 'application_id',
        sessionId: 'session_id',
        syncId: 'sync_id',
        createdTimestamp: 'created_at',
      },
      ...props,
    );
  }

  static async getExternal(client: Client, applicationId: Snowflake, ...images: string[]): Promise<ExternalAssets[]> {
    if (!client || !client.token || !client.api) throw new Error('Client must be set');
    // Check if applicationId is discord snowflake (17 , 18, 19 numbers)
    if (!/^[0-9]{17,19}$/.test(applicationId)) {
      throw new Error('Application id must be a Discord Snowflake');
    }
    // Check if images are 1 or 2
    if (images.length > 2) {
      throw new Error('RichPresence can only have up to 2 external images');
    }
    // Check if all images are valid URLs
    if (images.some(image => !URL.canParse(image))) {
      throw new Error('Each image must be a valid URL.');
    }
    const res = await client.api.applications[applicationId]['external-assets'].post<ExternalAssets[]>({
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
  constructor(client: Client | Presence | Activity, options: SpotifyRPCOptions = {}) {
    if (!client) throw new Error("Class constructor SpotifyRPC cannot be invoked without 'client'");
    super(client, {
      name: 'Spotify',
      type: ActivityTypes.LISTENING,
      party: {
        id: `spotify:${resolvePresence(client).client.user!.id}`,
      },
      id: 'spotify:1',
      flags: APIActivityFlags.Sync | APIActivityFlags.Play,
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
    ids.flat(2).forEach(id => artistIds.push(id));
    this.metadata = { ...this.metadata, artist_ids: artistIds };
    return this;
  }

  setAlbumId(id: string) {
    this.metadata = { ...this.metadata, album_id: id, context_uri: `spotify:album:${id}` };
    return this;
  }

  override toJSON() {
    return super.toJSON({ id: false, emoji: false, platform: false, buttons: false });
  }
}

export { Presence, Activity, RichPresenceAssets, CustomStatus, RichPresence, SpotifyRPC };
export default { Presence, Activity, RichPresenceAssets, CustomStatus, RichPresence, SpotifyRPC };
