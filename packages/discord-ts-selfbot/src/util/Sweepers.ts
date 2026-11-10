import { setInterval } from "node:timers";
import { Collection } from "@discordjs/collection";
import type { Client } from "../client/Client";
import _ConstantsModule from "./Constants";
import { isTextBasedChannel, isThreadChannel } from "../types/channels";

const { Events, ThreadChannelTypes, SweeperKeys } = _ConstantsModule;
import _DJSErrorModule from "../errors/DJSError";

const { TypeError } = _DJSErrorModule;
("use strict");

type SweepFilterFn = (
  value: unknown,
  key: unknown,
  collection: unknown
) => boolean;

interface SweepableManager {
  cache: Collection<string, unknown>;
}

function isSweepableManager(value: unknown): value is SweepableManager {
  return (
    typeof value === "object" &&
    value !== null &&
    "cache" in value &&
    value.cache instanceof Collection
  );
}

type SweepableGuildKey =
  | "autoModerationRules"
  | "bans"
  | "commands"
  | "emojis"
  | "invites"
  | "members"
  | "presences"
  | "stageInstances"
  | "stickers"
  | "voiceStates";

class Sweepers {
  client!: Client;
  options: Record<string, unknown>;
  intervals: Record<string, ReturnType<typeof setInterval> | null>;

  constructor(client: Client, options: Record<string, unknown>) {
    Object.defineProperty(this, "client", { value: client });

    this.options = options;

    this.intervals = Object.fromEntries(
      SweeperKeys.map((key: string) => [key, null])
    );

    for (const key of SweeperKeys) {
      if (!(key in options)) {
        continue;
      }

      this._validateProperties(key);

      const clonedOptions = {
        ...(this.options[key] as Record<string, unknown>),
      };

      // Handle cases that have a "lifetime"
      if (!("filter" in clonedOptions)) {
        switch (key) {
          case "invites": {
            clonedOptions.filter = Sweepers.expiredInviteSweepFilter(
              clonedOptions.lifetime as number
            );
            break;
          }
          case "messages": {
            clonedOptions.filter = Sweepers.outdatedMessageSweepFilter(
              clonedOptions.lifetime as number
            );
            break;
          }
          case "threads": {
            clonedOptions.filter = Sweepers.archivedThreadSweepFilter(
              clonedOptions.lifetime as number
            );
          }
        }
      }

      this._initInterval(
        key,
        `sweep${key[0].toUpperCase()}${key.slice(1)}`,
        clonedOptions
      );
    }
  }

  sweepApplicationCommands(filter: SweepFilterFn) {
    const { guilds, items: guildCommands } = this._sweepGuildDirectProp(
      "commands",
      filter,
      { emit: false }
    );

    const globalCommands =
      this.client.application?.commands.cache.sweep(filter) ?? 0;

    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${globalCommands} global application commands and ${guildCommands} guild commands in ${guilds} guilds.`
    );
    return guildCommands + globalCommands;
  }

  sweepAutoModerationRules(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("autoModerationRules", filter).items;
  }

  sweepBans(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("bans", filter).items;
  }

  sweepEmojis(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("emojis", filter).items;
  }

  sweepInvites(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("invites", filter).items;
  }

  sweepGuildMembers(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("members", filter, {
      outputName: "guild members",
    }).items;
  }

  sweepMessages(filter: SweepFilterFn) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }
    let channels = 0;
    let messages = 0;

    for (const channel of this.client.channels.cache.values()) {
      if (!isTextBasedChannel(channel)) {
        continue;
      }

      channels++;
      messages += channel.messages.cache.sweep(filter);
    }
    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${messages} messages in ${channels} text-based channels.`
    );
    return messages;
  }

  sweepPresences(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("presences", filter).items;
  }

  sweepReactions(filter: SweepFilterFn) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }
    let channels = 0;
    let messages = 0;
    let reactions = 0;

    for (const channel of this.client.channels.cache.values()) {
      if (!isTextBasedChannel(channel)) {
        continue;
      }
      channels++;

      for (const message of channel.messages.cache.values()) {
        messages++;
        reactions += message.reactions.cache.sweep(filter);
      }
    }
    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${reactions} reactions on ${messages} messages in ${channels} text-based channels.`
    );
    return reactions;
  }

  sweepStageInstances(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("stageInstances", filter, {
      outputName: "stage instances",
    }).items;
  }

  sweepStickers(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("stickers", filter).items;
  }

  sweepThreadMembers(filter: SweepFilterFn) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }

    let threads = 0;
    let members = 0;
    for (const channel of this.client.channels.cache.values()) {
      if (!isThreadChannel(channel)) {
        continue;
      }
      threads++;
      members += channel.members.cache.sweep(filter);
    }
    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${members} thread members in ${threads} threads.`
    );
    return members;
  }

  sweepThreads(filter: SweepFilterFn) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }

    let threads = 0;
    for (const [key, val] of this.client.channels.cache.entries()) {
      if (!ThreadChannelTypes.includes(val.type)) {
        continue;
      }
      if (filter(val, key, this.client.channels.cache)) {
        threads++;
        this.client.channels._remove(key);
      }
    }
    this.client.emit(Events.CACHE_SWEEP, `Swept ${threads} threads.`);
    return threads;
  }

  sweepUsers(filter: SweepFilterFn) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }

    const users = this.client.users.cache.sweep(filter);

    this.client.emit(Events.CACHE_SWEEP, `Swept ${users} users.`);

    return users;
  }

  sweepVoiceStates(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp("voiceStates", filter, {
      outputName: "voice states",
    }).items;
  }

  destroy() {
    for (const key of SweeperKeys) {
      if (this.intervals[key]) {
        clearInterval(this.intervals[key]);
      }
    }
  }

  static filterByLifetime({
    lifetime = 14_400,
    getComparisonTimestamp = (e: unknown) =>
      (e as { createdTimestamp?: number } | null)?.createdTimestamp,
    excludeFromSweep = () => false,
  }: Record<string, unknown> = {}) {
    if (typeof lifetime !== "number") {
      throw new TypeError("INVALID_TYPE", "lifetime", "number");
    }
    if (typeof getComparisonTimestamp !== "function") {
      throw new TypeError("INVALID_TYPE", "getComparisonTimestamp", "function");
    }
    if (typeof excludeFromSweep !== "function") {
      throw new TypeError("INVALID_TYPE", "excludeFromSweep", "function");
    }
    return () => {
      if (lifetime <= 0) {
        return null;
      }
      const lifetimeMs = lifetime * 1000;
      const now = Date.now();
      return (entry: unknown, key: unknown, coll: unknown) => {
        if (excludeFromSweep(entry, key, coll)) {
          return false;
        }
        const comparisonTimestamp = getComparisonTimestamp(entry, key, coll);
        if (!comparisonTimestamp || typeof comparisonTimestamp !== "number") {
          return false;
        }
        return now - comparisonTimestamp > lifetimeMs;
      };
    };
  }

  static archivedThreadSweepFilter(lifetime = 14_400) {
    return this.filterByLifetime({
      excludeFromSweep: (e: unknown) =>
        !(e as { archived?: boolean } | null)?.archived,
      getComparisonTimestamp: (e: unknown) =>
        (e as { archiveTimestamp?: number } | null)?.archiveTimestamp,
      lifetime,
    });
  }

  static expiredInviteSweepFilter(lifetime = 14_400) {
    return this.filterByLifetime({
      getComparisonTimestamp: (i: unknown) =>
        (i as { expiresTimestamp?: number } | null)?.expiresTimestamp,
      lifetime,
    });
  }

  static outdatedMessageSweepFilter(lifetime = 3600) {
    return this.filterByLifetime({
      getComparisonTimestamp: (m: unknown) =>
        (m as { editedTimestamp?: number; createdTimestamp?: number } | null)
          ?.editedTimestamp ??
        (m as { createdTimestamp?: number } | null)?.createdTimestamp,
      lifetime,
    });
  }

  _sweepGuildDirectProp(
    key: SweepableGuildKey,
    filter: SweepFilterFn,
    { emit = true, outputName }: { emit?: boolean; outputName?: string } = {}
  ) {
    if (typeof filter !== "function") {
      throw new TypeError("INVALID_TYPE", "filter", "function");
    }

    let guilds = 0;
    let items = 0;

    for (const guild of this.client.guilds.cache.values()) {
      const manager: unknown = Reflect.get(guild, key);
      if (!isSweepableManager(manager)) {
        continue;
      }

      guilds++;
      items += manager.cache.sweep(filter);
    }

    if (emit) {
      this.client.emit(
        Events.CACHE_SWEEP,
        `Swept ${items} ${outputName ?? key} in ${guilds} guilds.`
      );
    }

    return { guilds, items };
  }

  _validateProperties(key: string) {
    const props = this.options[key] as Record<string, unknown> | null;
    if (typeof props !== "object" || props === null) {
      throw new TypeError("INVALID_TYPE", `sweepers.${key}`, "object", true);
    }
    if (typeof props.interval !== "number") {
      throw new TypeError("INVALID_TYPE", `sweepers.${key}.interval`, "number");
    }
    // Invites, Messages, and Threads can be provided a lifetime parameter, which we use to generate the filter
    if (
      ["invites", "messages", "threads"].includes(key) &&
      !("filter" in props)
    ) {
      if (typeof props.lifetime !== "number") {
        throw new TypeError(
          "INVALID_TYPE",
          `sweepers.${key}.lifetime`,
          "number"
        );
      }
      return;
    }
    if (typeof props.filter !== "function") {
      throw new TypeError("INVALID_TYPE", `sweepers.${key}.filter`, "function");
    }
  }

  _initInterval(
    intervalKey: string,
    sweepKey: string,
    opts: Record<string, unknown>
  ) {
    const interval = opts.interval as number;
    if (interval <= 0 || interval === Infinity) {
      return;
    }
    const filter = opts.filter as () => SweepFilterFn | null;
    this.intervals[intervalKey] = setInterval(() => {
      const sweepFn = filter();
      if (sweepFn === null) {
        return;
      }
      if (typeof sweepFn !== "function") {
        throw new TypeError("SWEEP_FILTER_RETURN");
      }
      (this as unknown as Record<string, (fn: SweepFilterFn) => number>)[
        sweepKey
      ](sweepFn);
    }, interval * 1000).unref();
  }
}

export default Sweepers;
export { Sweepers };
