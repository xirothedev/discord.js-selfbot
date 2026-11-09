import { randomUUID } from 'node:crypto';
import type { APIPartialEmoji, Snowflake } from 'discord-api-types/v10';
import Base from './Base';
import type { RawActivityData } from '../../typings/rawDataTypes';
import type { ActivityOptions, ActivityPlatform, ActivityType, RichPresenceMetadata } from '../../typings';
import ActivityFlags from '../util/ActivityFlags';
import _ConstantsModule from '../util/Constants';
const { ActivityTypes } = _ConstantsModule;
import Util from '../util/Util';

/**
 * Activity sent in a message.
 * @typedef {Object} MessageActivity
 * @property {string} [partyId] Id of the party represented in activity
 * @property {MessageActivityType} type Type of activity sent
 */

/**
 * The status of this presence:
 * * **`online`** - user is online
 * * **`idle`** - user is AFK
 * * **`offline`** - user is offline or invisible
 * * **`dnd`** - user is in Do Not Disturb
 * @typedef {string} PresenceStatus
 */

/**
 * The status of this presence:
 * * **`online`** - user is online
 * * **`idle`** - user is AFK
 * * **`dnd`** - user is in Do Not Disturb
 * @typedef {string} ClientPresenceStatus
 */

/**
 * Represents a user's presence.
 * @extends {Base}
 */
class Presence extends Base {
  [key: string]: any;
  constructor(client: any, data: any = {}) {
    super(client);

    /**
     * The presence's user id
     * @type {Snowflake}
     */
    this.userId = data.user.id;

    /**
     * The guild this presence is in
     * @type {?Guild}
     */
    this.guild = data.guild ?? null;

    this._patch(data);
  }

  /**
   * The user of this presence
   * @type {?User}
   * @readonly
   */
  get user() {
    return this.client.users.resolve(this.userId);
  }

  /**
   * The member of this presence
   * @type {?GuildMember}
   * @readonly
   */
  get member() {
    return this.guild.members.resolve(this.userId);
  }

  _patch(data: any) {
    if ('status' in data) {
      /**
       * The status of this presence
       * @type {PresenceStatus}
       */
      this.status = data.status;
    } else {
      this.status ??= 'offline';
    }

    if ('activities' in data) {
      /**
       * The activities of this presence (Always `Activity[]` if not ClientUser)
       * @type {CustomStatus[]|RichPresence[]|SpotifyRPC[]|Activity[]}
       */
      this.activities = data.activities.map((activity: any) => {
        if (this.userId == this.client.user!.id) {
          if ([ActivityTypes.CUSTOM, 'CUSTOM'].includes(activity.type)) {
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
      /**
       * The devices this presence is on
       * @type {?Object}
       * @property {?ClientPresenceStatus} web The current presence in the web application
       * @property {?ClientPresenceStatus} mobile The current presence in the mobile application
       * @property {?ClientPresenceStatus} desktop The current presence in the desktop application
       */
      this.clientStatus = data.client_status;
    } else {
      this.clientStatus ??= null;
    }

    if ('last_modified' in data) {
      /**
       * The timestamp this presence was last updated
       * @type {number}
       */
      this.lastModified = data.last_modified;
    }

    if ('afk' in data) {
      this.afk = data.afk;
    } else {
      this.afk ??= false;
    }

    if ('since' in data) {
      this.since = data.since;
    } else {
      this.since ??= 0;
    }

    return this;
  }

  _clone() {
    const clone = Object.assign(Object.create(this), this);
    clone.activities = this.activities.map((activity: any) => activity._clone());
    return clone;
  }

  /**
   * Whether this presence is equal to another.
   * @param {Presence} presence The presence to compare with
   * @returns {boolean}
   */
  equals(presence: any) {
    return (
      this === presence ||
      (presence &&
        this.status === presence.status &&
        this.clientStatus?.web === presence.clientStatus?.web &&
        this.clientStatus?.mobile === presence.clientStatus?.mobile &&
        this.clientStatus?.desktop === presence.clientStatus?.desktop &&
        this.activities.length === presence.activities.length &&
        this.activities.every((activity: any, index: any) => activity.equals(presence.activities[index])))
    );
  }

  toJSON() {
    return Util.flatten(this);
  }
}

/**
 * The platform of this activity:
 * * **`desktop`**
 * * **`samsung`** - playing on Samsung Galaxy
 * * **`xbox`** - playing on Xbox Live
 * * **`ios`**
 * * **`android`**
 * * **`embedded`**
 * * **`ps4`**
 * * **`ps5`**
 * @typedef {string} ActivityPlatform
 */

/**
 * Represents an activity that is part of a user's presence.
 */
type ActivityPatch = RawActivityData & {
  createdTimestamp?: number;
  applicationId?: Snowflake;
  syncId?: string;
};

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

  constructor(presence: Presence, data: RawActivityData) {
    if (!(presence instanceof Presence)) {
      throw new Error("Class constructor Activity cannot be invoked without 'presence'");
    }
    /**
     * The presence of the Activity
     * @type {Presence}
     * @readonly
     * @name Activity#presence
     */
    Object.defineProperty(this, 'presence', { value: presence });

    this._patch(data);
  }

  _patch(data: ActivityPatch) {
    if ('id' in data) {
      /**
       * The activity's id
       * @type {string}
       */
      this.id = data.id;
    }

    if ('name' in data) {
      /**
       * The activity's name
       * @type {string}
       */
      this.name = data.name;
    }

    if ('type' in data) {
      /**
       * The activity status's type
       * @type {ActivityType}
       */
      this.type = typeof data.type === 'number' ? ActivityTypes[data.type] : data.type;
    }

    if ('url' in data) {
      /**
       * If the activity is being streamed, a link to the stream
       * @type {?string}
       */
      this.url = data.url ?? null;
    } else {
      this.url = null;
    }

    if (data.created_at !== undefined || data.createdTimestamp !== undefined) {
      /**
       * Creation date of the activity
       * @type {number}
       */
      this.createdTimestamp = data.created_at ?? data.createdTimestamp ?? 0;
    }

    if ('session_id' in data) {
      /**
       * The game's or Spotify session's id
       * @type {?string}
       */
      this.sessionId = data.session_id ?? null;
    } else {
      this.sessionId = this.presence.client?.sessionId ?? null;
    }

    if ('platform' in data) {
      /**
       * The platform the game is being played on
       * @type {?ActivityPlatform}
       */
      this.platform = isActivityPlatform(data.platform) ? data.platform : null;
    } else {
      this.platform = null;
    }

    if ('timestamps' in data && data.timestamps) {
      /**
       * Represents timestamps of an activity
       * @typedef {Object} ActivityTimestamps
       * @property {?number} start When the activity started
       * @property {?number} end When the activity will end
       */

      /**
       * Timestamps for the activity
       * @type {?ActivityTimestamps}
       */
      this.timestamps = {
        start: data.timestamps.start ? new Date(data.timestamps.start).getTime() : null,
        end: data.timestamps.end ? new Date(data.timestamps.end).getTime() : null,
      };
    } else {
      this.timestamps = null;
    }

    if ('application_id' in data || 'applicationId' in data) {
      /**
       * The id of the application associated with this activity
       * @type {?Snowflake}
       */
      this.applicationId = data.application_id ?? data.applicationId ?? null;
    } else {
      this.applicationId = null;
    }

    if ('details' in data) {
      /**
       * Details about the activity
       * @type {?string}
       */
      this.details = data.details ?? null;
    } else {
      this.details = null;
    }

    if ('state' in data) {
      /**
       * State of the activity
       * @type {?string}
       */
      this.state = data.state ?? null;
    } else {
      this.state = null;
    }

    if ('sync_id' in data || 'syncId' in data) {
      /**
       * The sync id of the activity
       * <info>This property is not documented by Discord and represents the track id in spotify activities.</info>
       * @type {?string}
       */
      this.syncId = data.sync_id ?? data.syncId ?? null;
    } else {
      this.syncId = null;
    }

    if ('flags' in data) {
      /**
       * Flags that describe the activity
       * @type {Readonly<ActivityFlags>}
       */
      this.flags = new ActivityFlags(data.flags).freeze();
    } else {
      this.flags = new ActivityFlags().freeze();
    }

    if ('buttons' in data) {
      /**
       * The labels of the buttons of this rich presence
       * @type {string[]}
       */
      this.buttons = data.buttons?.map(button => (typeof button === 'string' ? button : button.label)) ?? [];
    } else {
      this.buttons = [];
    }

    if ('emoji' in data && data.emoji) {
      /**
       * Emoji for a custom activity
       * @type {?EmojiIdentifierResolvable}
       */
      this.emoji = Util.resolvePartialEmoji(data.emoji);
    } else {
      this.emoji = null;
    }

    if ('party' in data) {
      /**
       * Represents a party of an activity
       * @typedef {Object} ActivityParty
       * @property {?string} id The party's id
       * @property {number[]} size Size of the party as `[current, max]`
       */

      /**
       * Party of the activity
       * @type {?ActivityParty}
       */
      this.party = data.party ? { id: data.party.id ?? null, size: data.party.size ?? [0, 0] } : null;
    } else {
      this.party = null;
    }

    /**
     * Assets for rich presence
     * @type {?RichPresenceAssets}
     */
    this.assets = new RichPresenceAssets(this, data.assets);
  }

  /**
   * Whether this activity is equal to another activity.
   * @param {Activity} activity The activity to compare with
   * @returns {boolean}
   */
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

  /**
   * The time the activity was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * When concatenated with a string, this automatically returns the activities' name instead of the Activity object.
   * @returns {string}
   */
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
      type: typeof this.type === 'number' ? this.type : ActivityTypes[this.type],
    };
  }
}

/**
 * Assets for a rich presence
 */
class RichPresenceAssets {
  [key: string]: any;
  constructor(activity: any, assets: any) {
    /**
     * The activity of the RichPresenceAssets
     * @type {Activity}
     * @readonly
     * @name RichPresenceAssets#activity
     */
    Object.defineProperty(this, 'activity', { value: activity });

    this._patch(assets);
  }

  _patch(assets: any = {}) {
    if ('large_text' in assets || 'largeText' in assets) {
      /**
       * Hover text for the large image
       * @type {?string}
       */
      this.largeText = assets.large_text || assets.largeText;
    } else {
      this.largeText = null;
    }

    if ('small_text' in assets || 'smallText' in assets) {
      /**
       * Hover text for the small image
       * @type {?string}
       */
      this.smallText = assets.small_text || assets.smallText;
    } else {
      this.smallText = null;
    }

    if ('large_image' in assets || 'largeImage' in assets) {
      /**
       * The large image asset's id
       * @type {?Snowflake}
       */
      this.largeImage = assets.large_image || assets.largeImage;
    } else {
      this.largeImage = null;
    }

    if ('small_image' in assets || 'smallImage' in assets) {
      /**
       * The small image asset's id
       * @type {?Snowflake}
       */
      this.smallImage = assets.small_image || assets.smallImage;
    } else {
      this.smallImage = null;
    }
  }

  /**
   * Gets the URL of the small image asset
   * @param {StaticImageURLOptions} [options] Options for the image URL
   * @returns {?string}
   */
  smallImageURL({ format, size }: any = {}) {
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

    return this.activity.presence.client.rest.cdn.AppAsset(this.activity.applicationId, this.smallImage, {
      format,
      size,
    });
  }

  /**
   * Gets the URL of the large image asset
   * @param {StaticImageURLOptions} [options] Options for the image URL
   * @returns {?string}
   */
  largeImageURL({ format, size }: any = {}) {
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

    return this.activity.presence.client.rest.cdn.AppAsset(this.activity.applicationId, this.largeImage, {
      format,
      size,
    });
  }

  static parseImage(image: any) {
    if (typeof image != 'string') {
      image = null;
    } else if (URL.canParse(image) && ['http:', 'https:'].includes(new URL(image).protocol)) {
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
    } else if (['mp:', 'youtube:', 'spotify:', 'twitch:'].some((v: any) => image.startsWith(v))) {
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

  /**
   * @typedef {string} RichPresenceImage
   * Support:
   * - cdn.discordapp.com
   * - media.discordapp.net
   * - Assets ID (https://discord.com/api/v9/oauth2/applications/{application_id}/assets)
   * - Media Proxy (mp:external/{hash})
   * - Twitch (twitch:{username})
   * - YouTube (youtube:{video_id})
   * - Spotify (spotify:{image_id})
   */

  /**
   * Set the large image of this activity
   * @param {?RichPresenceImage} image The large image asset's id
   * @returns {RichPresenceAssets}
   */
  setLargeImage(image: any) {
    image = RichPresenceAssets.parseImage(image);
    this.largeImage = image;
    return this;
  }

  /**
   * Set the small image of this activity
   * @param {?RichPresenceImage} image The small image asset's id
   * @returns {RichPresenceAssets}
   */
  setSmallImage(image: any) {
    image = RichPresenceAssets.parseImage(image);
    this.smallImage = image;
    return this;
  }

  /**
   * Hover text for the large image
   * @param {string} text Assets text
   * @returns {RichPresenceAssets}
   */
  setLargeText(text: any) {
    this.largeText = text;
    return this;
  }

  /**
   * Hover text for the small image
   * @param {string} text Assets text
   * @returns {RichPresenceAssets}
   */
  setSmallText(text: any) {
    this.smallText = text;
    return this;
  }
}

class CustomStatus extends Activity {
  [key: string]: any;
  /**
   * @typedef {Object} CustomStatusOptions
   * @property {string} [state] The state to be displayed
   * @property {EmojiIdentifierResolvable} [emoji] The emoji to be displayed
   */

  /**
   * @param {Client} client Discord Client
   * @param {CustomStatus|CustomStatusOptions} [data={}] CustomStatus to clone or raw data
   */
  constructor(client: any, data: any = {}) {
    if (!client) throw new Error("Class constructor CustomStatus cannot be invoked without 'client'");
    super('presence' in client ? client.presence : client, {
      name: ' ',
      type: ActivityTypes.CUSTOM,
      ...data,
    });
  }

  /**
   * Set the emoji of this activity
   * @param {EmojiIdentifierResolvable} emoji The emoji to be displayed
   * @returns {CustomStatus}
   */
  setEmoji(emoji: any) {
    this.emoji = Util.resolvePartialEmoji(emoji);
    return this;
  }

  /**
   * Set state of this activity
   * @param {string | null} state The state to be displayed
   * @returns {CustomStatus}
   */
  setState(state: any) {
    if (typeof state == 'string' && state.length > 128) throw new Error('State must be less than 128 characters');
    this.state = state;
    return this;
  }

  /**
   * Returns an object that can be used to set the status
   * @returns {CustomStatus}
   */
  override toJSON(): ActivityOptions {
    if (!this.emoji && !this.state) throw new Error('CustomStatus must have at least one of emoji or state');
    return {
      ...{ name: this.name, type: ActivityTypes.CUSTOM, state: this.state },
      ...(this.emoji ? { emoji: this.emoji } : {}),
    };
  }
}

class RichPresence extends Activity {
  declare metadata: RichPresenceMetadata;
  [key: string]: any;
  /**
   * @param {Client} client Discord client
   * @param {RichPresence} [data={}] RichPresence to clone or raw data
   */
  constructor(client: any, data: any = {}) {
    if (!client) throw new Error("Class constructor RichPresence cannot be invoked without 'client'");
    super('presence' in client ? client.presence : client, { type: 0, ...data });
    this.setup(data);
  }

  /**
   * Sets the status from a JSON object
   * @param {RichPresence} data data
   * @private
   */
  setup(data: any = {}) {
    this.secrets = 'secrets' in data ? data.secrets : {};
    const metadata: RichPresenceMetadata = 'metadata' in data ? data.metadata : {};
    this.metadata = metadata;
  }

  /**
   * Set the large image of this activity
   * @param {?RichPresenceImage} image The large image asset's id
   * @returns {RichPresence}
   */
  setAssetsLargeImage(image: any) {
    this.assets.setLargeImage(image);
    return this;
  }

  /**
   * Set the small image of this activity
   * @param {?RichPresenceImage} image The small image asset's id
   * @returns {RichPresence}
   */
  setAssetsSmallImage(image: any) {
    this.assets.setSmallImage(image);
    return this;
  }

  /**
   * Hover text for the large image
   * @param {string} text Assets text
   * @returns {RichPresence}
   */
  setAssetsLargeText(text: any) {
    this.assets.setLargeText(text);
    return this;
  }

  /**
   * Hover text for the small image
   * @param {string} text Assets text
   * @returns {RichPresence}
   */
  setAssetsSmallText(text: any) {
    this.assets.setSmallText(text);
    return this;
  }

  /**
   * Set the name of the activity
   * @param {?string} name The activity's name
   * @returns {RichPresence}
   */
  setName(name: any) {
    this.name = name;
    return this;
  }

  /**
   * If the activity is being streamed, a link to the stream
   * @param {?string} url URL of the stream
   * @returns {RichPresence}
   */
  setURL(url: any) {
    if (typeof url == 'string' && !URL.canParse(url)) throw new Error('URL must be a valid URL');
    this.url = url;
    return this;
  }

  /**
   * The activity status's type
   * @param {?ActivityTypes} type The type of activity
   * @returns {RichPresence}
   */
  setType(type: any) {
    this.type = typeof type == 'number' ? type : ActivityTypes[type];
    return this;
  }

  /**
   * Set the application id of this activity
   * @param {?Snowflake} id Bot's id
   * @returns {RichPresence}
   */
  setApplicationId(id: any) {
    this.applicationId = id;
    return this;
  }

  /**
   * Set the state of the activity
   * @param {?string} state The state of the activity
   * @returns {RichPresence}
   */
  setState(state: any) {
    this.state = state;
    return this;
  }

  /**
   * Set the details of the activity
   * @param {?string} details The details of the activity
   * @returns {RichPresence}
   */
  setDetails(details: any) {
    this.details = details;
    return this;
  }

  /**
   * @typedef {Object} RichParty
   * @property {string} id The id of the party
   * @property {number} max The maximum number of members in the party
   * @property {number} current The current number of members in the party
   */

  /**
   * Set the party of this activity
   * @param {?RichParty} party The party to be displayed
   * @returns {RichPresence}
   */
  setParty(party: any) {
    if (typeof party == 'object') {
      if (!party.max || typeof party.max != 'number') throw new Error('Party must have max number');
      if (!party.current || typeof party.current != 'number') throw new Error('Party must have current');
      if (party.current > party.max) throw new Error('Party current must be less than max number');
      if (!party.id || typeof party.id != 'string') party.id = randomUUID();
      this.party = {
        size: [party.current, party.max],
        id: party.id,
      };
    } else {
      this.party = null;
    }
    return this;
  }

  /**
   * Sets the start timestamp of the activity
   * @param {Date|number|null} timestamp The timestamp of the start of the activity
   * @returns {RichPresence}
   */
  setStartTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) this.timestamps = { start: null, end: null };
    this.timestamps.start = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  /**
   * Sets the end timestamp of the activity
   * @param {Date|number|null} timestamp The timestamp of the end of the activity
   * @returns {RichPresence}
   */
  setEndTimestamp(timestamp: Date | number | null) {
    if (!this.timestamps) this.timestamps = { start: null, end: null };
    this.timestamps.end = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  /**
   * @typedef {object} RichButton
   * @property {string} name The name of the button
   * @property {string} url The url of the button
   */
  /**
   * Set the buttons of the rich presence
   * @param  {...?RichButton} button A list of buttons to set
   * @returns {RichPresence}
   */
  setButtons(...button: any[]) {
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

    button.flat(2).forEach((b: any) => {
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

  /**
   * The platform the activity is being played on
   * @param {ActivityPlatform | null} platform Any platform
   * @returns {RichPresence}
   */
  setPlatform(platform: any) {
    this.platform = platform;
    return this;
  }

  /**
   * Secrets for rich presence joining and spectating (send-only)
   * @param {?string} join Secrets for rich presence joining
   * @returns {RichPresence}
   */
  setJoinSecret(join: any) {
    this.secrets.join = join;
    return this;
  }

  /**
   * Add a button to the rich presence
   * @param {string} name The name of the button
   * @param {string} url The url of the button
   * @returns {RichPresence}
   */
  addButton(name: any, url: any) {
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

  /**
   * Convert the rich presence to a JSON object
   * @returns {Object}
   */
  override toJSON(...props: any[]) {
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

  /**
   * @typedef {Object} ExternalAssets
   * @property {?string} url Orginal url of the image
   * @property {?string} external_asset_path Proxy url of the image (Using to RPC)
   */

  /**
   * Retrieves external assets from a RichPresence
   * @param {Client} client - The Discord client instance.
   * @param {Snowflake} applicationId - The application ID associated with the Rich Presence.
   * @param {...string} images - 1 or 2 external image URLs (not hosted by Discord).
   * @returns {Promise<ExternalAssets[]>}
   */
  static async getExternal(client: any, applicationId: any, ...images: any[]) {
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
    if (images.some((image: any) => !URL.canParse(image))) {
      throw new Error('Each image must be a valid URL.');
    }
    const res = await client.api.applications[applicationId]['external-assets'].post({
      data: {
        urls: images,
      },
    });
    return res;
  }

  /**
   * When concatenated with a string, this automatically returns the activities' name instead of the Activity object.
   * @returns {string}
   */
  override toString() {
    return this.name;
  }

  override _clone() {
    return Object.assign(Object.create(this), this);
  }
}

/**
 * @extends {RichPresence}
 */
class SpotifyRPC extends RichPresence {
  [key: string]: any;
  /**
   * Create a new RichPresence (Spotify style)
   * @param {Client} client Discord Client
   * @param {SpotifyRPC} [options] Options for the Spotify RPC
   */
  constructor(client: any, options: any = {}) {
    if (!client) throw new Error("Class constructor SpotifyRPC cannot be invoked without 'client'");
    super(client, {
      name: 'Spotify',
      type: ActivityTypes.LISTENING,
      party: {
        id: `spotify:${client.user!.id}`,
      },
      id: 'spotify:1',
      flags: 48, // Sync + Play (ActivityFlags)
      ...options,
    });
    this.setup(options);
  }
  /**
   * Sets the status from a JSON object
   * @param {SpotifyRPC} options data
   * @private
   */
  override setup(options: any) {
    /**
     * @typedef {Object} SpotifyMetadata
     * @property {string} album_id The Spotify ID of the album of the song being played
     * @property {Array<string>} artist_ids The Spotify IDs of the artists of the song being played
     * @property {string} context_uri The Spotify URI of the current player context
     */

    /**
     * Spotify metadata
     * @type {SpotifyMetadata}
     */
    const metadata: RichPresenceMetadata = {
      album_id: options.metadata?.album_id || undefined,
      artist_ids: options.metadata?.artist_ids || [],
      context_uri: options.metadata?.context_uri || undefined,
    };
    this.metadata = metadata;
  }

  /**
   * Set Spotify song id to sync with
   * @param {string} id Song id
   * @returns {SpotifyRPC}
   */
  setSongId(id: any) {
    this.syncId = id;
    return this;
  }

  /**
   * Add the artist id
   * @param {string} id Artist id
   * @returns {SpotifyRPC}
   */
  addArtistId(id: any) {
    const artistIds = this.metadata.artist_ids ?? [];
    artistIds.push(id);
    this.metadata = { ...this.metadata, artist_ids: artistIds };
    return this;
  }

  /**
   * Set the artist ids
   * @param {string | Array<string>} ids Artist ids
   * @returns {SpotifyRPC}
   */
  setArtistIds(...ids: any[]) {
    const artistIds = ids?.length ? (this.metadata.artist_ids ?? []) : [];
    ids.flat(2).forEach((id: any) => artistIds.push(id));
    this.metadata = { ...this.metadata, artist_ids: artistIds };
    return this;
  }

  /**
   * Set the album id
   * @param {string} id Album id
   * @returns {SpotifyRPC}
   */
  setAlbumId(id: any) {
    this.metadata = { ...this.metadata, album_id: id, context_uri: `spotify:album:${id}` };
    return this;
  }

  override toJSON() {
    return super.toJSON({ id: false, emoji: false, platform: false, buttons: false });
  }
}

export { Presence, Activity, RichPresenceAssets, CustomStatus, RichPresence, SpotifyRPC };
export default { Presence, Activity, RichPresenceAssets, CustomStatus, RichPresence, SpotifyRPC };
