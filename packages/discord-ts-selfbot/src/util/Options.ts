import Util from './Util';
import { randomUUID } from 'node:crypto';
import _ConstantsModule from './Constants';
const { UserAgent } = _ConstantsModule;
import Intents from './Intents';
import { Collection } from '@discordjs/collection';
import LimitedCollection from './LimitedCollection';
import type {
  BitFieldResolvable,
  ClientOptions,
  HTTPOptions,
  IntentsString,
  PartialTypes,
  PresenceData,
  SweeperOptions,
  WebSocketOptions,
} from '../../typings';
('use strict');

export interface ResolvedWebSocketOptions extends Omit<WebSocketOptions, 'agent'> {
  agent: unknown;
  compress: boolean;
  properties: NonNullable<WebSocketOptions['properties']> & Record<string, unknown>;
  capabilities: number;
  client_state: { guild_versions: Record<string, unknown> };
  version: number;
  presence?: unknown;
}

export interface ResolvedHTTPOptions extends Omit<HTTPOptions, 'agent'> {
  agent: unknown;
  headers: Record<string, string>;
  version: number;
  api: string;
  cdn: string;
  invite: string;
  template: string;
  scheduledEvent: string;
}

export interface ResolvedClientOptions extends Omit<
  ClientOptions,
  'TOTPKey' | 'shards' | 'ws' | 'http' | 'presence' | 'makeCache'
> {
  TOTPKey: string | null;
  shards?: number[] | 'auto';
  makeCache: (manager: { name: string }, holds: { name: string }) => Collection<unknown, unknown>;
  presence: PresenceData & { since?: number };
  sweepers: SweeperOptions;
  partials: PartialTypes[];
  intents: BitFieldResolvable<IntentsString, number>;
  DMChannelVoiceStatusSync: number;
  captchaRetryLimit: number;
  captchaSolver: NonNullable<ClientOptions['captchaSolver']>;
  closeTimeout: number;
  messageCacheLifetime: number;
  messageSweepInterval: number;
  invalidRequestWarningInterval: number;
  restWsBridgeTimeout: number;
  restTimeOffset: number;
  restRequestTimeout: number;
  restSweepInterval: number;
  restGlobalRateLimit: number;
  retryLimit: number;
  failIfNotExists: boolean;
  waitGuildTimeout: number;
  shardCount: number;
  ws: ResolvedWebSocketOptions;
  http: ResolvedHTTPOptions;
}

class Options extends null {
  static defaultSweeperSettings: Record<string, unknown> = {};
  static createDefault(): ResolvedClientOptions {
    return {
      DMChannelVoiceStatusSync: 0,
      captchaRetryLimit: 3,
      captchaSolver: () => {
        const err = new Error('CAPTCHA_SOLVER_NOT_IMPLEMENTED');
        err.cause =
          'You need to provide a captcha solver to use this feature\nExample: const client = new Client({ captchaSolver: yourAsyncFunction })';
        throw err;
      },
      TOTPKey: null,
      closeTimeout: 5_000,
      waitGuildTimeout: 15_000,
      // Selfbot divergence: shard defaults are resolved in Client#_validateOptions. `shards` is intentionally
      // absent so an explicit `shardCount` is not overridden by the default single-shard list.
      shardCount: 1,
      makeCache: this.cacheWithLimits(this.defaultMakeCacheSettings),
      messageCacheLifetime: 0,
      messageSweepInterval: 0,
      invalidRequestWarningInterval: 0,
      intents: Intents.ALL,
      partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'GUILD_SCHEDULED_EVENT'], // Enable the partials
      restWsBridgeTimeout: 5_000,
      restRequestTimeout: 15_000,
      restGlobalRateLimit: 0,
      retryLimit: 1,
      restTimeOffset: 500,
      restSweepInterval: 60,
      failIfNotExists: true,
      presence: { status: 'online', since: 0, activities: [], afk: true },
      sweepers: {},
      ws: {
        capabilities: 0, // https://discord-userdoccers.vercel.app/topics/gateway#gateway-capabilities
        properties: {
          os: 'Windows',
          browser: 'Discord Client',
          release_channel: 'stable',
          client_version: '1.0.9210',
          os_version: '10.0.19044',
          os_arch: 'x64',
          app_arch: 'x64',
          system_locale: 'en-US',
          has_client_mods: false,
          client_launch_id: randomUUID(),
          browser_user_agent: UserAgent,
          browser_version: '35.3.0',
          os_sdk_version: '19044',
          client_build_number: 455964,
          native_build_number: 69976,
          client_event_source: null,
          launch_signature: randomUUID(),
          client_heartbeat_session_id: randomUUID(),
          client_app_state: 'focused',
        },
        compress: false,
        client_state: {
          guild_versions: {},
        },
        version: 9,
        agent: {},
      },
      http: {
        agent: {},
        headers: {
          'User-Agent': UserAgent,
        },
        version: 9,
        api: 'https://discord.com/api',
        cdn: 'https://cdn.discordapp.com',
        invite: 'https://discord.gg',
        template: 'https://discord.new',
        scheduledEvent: 'https://discord.com/events',
      },
    };
  }

  static cacheWithLimits(settings: Record<string, unknown> = {}) {
    return (manager: { name: string }) => {
      const setting = settings[manager.name];
      /* eslint-disable-next-line eqeqeq */
      if (setting == null) {
        return new Collection();
      }
      if (typeof setting === 'number') {
        if (setting === Infinity) {
          return new Collection();
        }
        return new LimitedCollection({ maxSize: setting });
      }
      const s = setting as Record<string, unknown>;
      /* eslint-disable eqeqeq */
      const noSweeping =
        s.sweepFilter == null ||
        s.sweepInterval == null ||
        (s.sweepInterval as number) <= 0 ||
        s.sweepInterval === Infinity;
      const noLimit = s.maxSize == null || s.maxSize === Infinity;
      /* eslint-enable eqeqeq */
      if (noSweeping && noLimit) {
        return new Collection();
      }
      return new LimitedCollection(s);
    };
  }

  static cacheEverything() {
    return () => new Collection();
  }

  static get defaultMakeCacheSettings() {
    return {
      MessageManager: 200,
      ChannelManager: {
        sweepInterval: 3600,
        sweepFilter: Util.archivedThreadSweepFilter(),
      },
      GuildChannelManager: {
        sweepInterval: 3600,
        sweepFilter: Util.archivedThreadSweepFilter(),
      },
      ThreadManager: {
        sweepInterval: 3600,
        sweepFilter: Util.archivedThreadSweepFilter(),
      },
    };
  }
}

Options.defaultSweeperSettings = {
  threads: {
    interval: 3600,
    lifetime: 14400,
  },
};

export default Options;
export { Options };
