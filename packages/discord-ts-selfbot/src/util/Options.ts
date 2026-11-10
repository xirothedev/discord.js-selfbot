import Util from "./Util";
import _ConstantsModule from "./Constants";

const { UserAgent } = _ConstantsModule;
import Intents from "./Intents";
import { Collection } from "@discordjs/collection";
import LimitedCollection from "./LimitedCollection";
import type {
  BitFieldResolvable,
  ClientOptions,
  HTTPOptions,
  IntentsString,
  PartialTypes,
  PresenceData,
  SweeperOptions,
  WebSocketOptions,
} from "../../typings";

("use strict");

export interface ResolvedWebSocketOptions extends Omit<
  WebSocketOptions,
  "agent"
> {
  agent: unknown;
  compress: boolean;
  properties: NonNullable<WebSocketOptions["properties"]> &
    Record<string, unknown>;
  capabilities: number;
  client_state: { guild_versions: Record<string, unknown> };
  version: number;
  presence?: unknown;
}

export interface ResolvedHTTPOptions extends Omit<HTTPOptions, "agent"> {
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
  "TOTPKey" | "shards" | "ws" | "http" | "presence" | "makeCache"
> {
  TOTPKey: string | null;
  shards?: number[] | "auto";
  makeCache: (
    manager: { name: string },
    holds: { name: string }
  ) => Collection<unknown, unknown>;
  presence: PresenceData & { since?: number };
  sweepers: SweeperOptions;
  partials: PartialTypes[];
  intents: BitFieldResolvable<IntentsString, number>;
  DMChannelVoiceStatusSync: number;
  captchaRetryLimit: number;
  captchaSolver: NonNullable<ClientOptions["captchaSolver"]>;
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
        const err = new Error("CAPTCHA_SOLVER_NOT_IMPLEMENTED");
        err.cause =
          "You need to provide a captcha solver to use this feature\nExample: const client = new Client({ captchaSolver: yourAsyncFunction })";
        throw err;
      },
      TOTPKey: null,
      closeTimeout: 5000,
      waitGuildTimeout: 15_000,
      // Selfbot divergence: shard defaults are resolved in Client#_validateOptions. `shards` is intentionally
      // absent so an explicit `shardCount` is not overridden by the default single-shard list.
      shardCount: 1,
      makeCache: this.cacheWithLimits(this.defaultMakeCacheSettings),
      messageCacheLifetime: 0,
      messageSweepInterval: 0,
      invalidRequestWarningInterval: 0,
      intents: Intents.ALL,
      partials: [
        "USER",
        "CHANNEL",
        "GUILD_MEMBER",
        "MESSAGE",
        "REACTION",
        "GUILD_SCHEDULED_EVENT",
      ], // Enable the partials
      restWsBridgeTimeout: 5000,
      restRequestTimeout: 15_000,
      restGlobalRateLimit: 0,
      retryLimit: 1,
      restTimeOffset: 500,
      restSweepInterval: 60,
      failIfNotExists: true,
      presence: { activities: [], afk: true, since: 0, status: "online" },
      sweepers: {},
      ws: {
        agent: {},
        capabilities: 0, // https://discord-userdoccers.vercel.app/topics/gateway#gateway-capabilities
        client_state: {
          guild_versions: {},
        },
        compress: false,
        properties: {
          app_arch: "x64",
          browser: "Discord Client",
          browser_user_agent: UserAgent,
          browser_version: "35.3.0",
          client_app_state: "focused",
          client_build_number: 455964,
          client_event_source: null,
          client_heartbeat_session_id: crypto.randomUUID(),
          client_launch_id: crypto.randomUUID(),
          client_version: "1.0.9210",
          has_client_mods: false,
          launch_signature: crypto.randomUUID(),
          native_build_number: 69976,
          os: "Windows",
          os_arch: "x64",
          os_sdk_version: "19044",
          os_version: "10.0.19044",
          release_channel: "stable",
          system_locale: "en-US",
        },
        version: 9,
      },
      http: {
        agent: {},
        api: "https://discord.com/api",
        cdn: "https://cdn.discordapp.com",
        headers: {
          "User-Agent": UserAgent,
        },
        invite: "https://discord.gg",
        scheduledEvent: "https://discord.com/events",
        template: "https://discord.new",
        version: 9,
      },
    };
  }

  static cacheWithLimits(settings: Record<string, unknown> = {}) {
    return (manager: { name: string }) => {
      const setting = settings[manager.name];
      if (setting == null) {
        return new Collection();
      }
      if (typeof setting === "number") {
        if (setting === Infinity) {
          return new Collection();
        }
        return new LimitedCollection({ maxSize: setting });
      }
      const s = setting as Record<string, unknown>;
      const noSweeping =
        s.sweepFilter == null ||
        s.sweepInterval == null ||
        (s.sweepInterval as number) <= 0 ||
        s.sweepInterval === Infinity;
      const noLimit = s.maxSize == null || s.maxSize === Infinity;
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
      ChannelManager: {
        sweepFilter: Util.archivedThreadSweepFilter(),
        sweepInterval: 3600,
      },
      GuildChannelManager: {
        sweepFilter: Util.archivedThreadSweepFilter(),
        sweepInterval: 3600,
      },
      MessageManager: 200,
      ThreadManager: {
        sweepFilter: Util.archivedThreadSweepFilter(),
        sweepInterval: 3600,
      },
    };
  }
}

Options.defaultSweeperSettings = {
  threads: {
    interval: 3600,
    lifetime: 14_400,
  },
};

export default Options;
export { Options };
