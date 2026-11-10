import EventEmitter from "node:events";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Collection } from "@discordjs/collection";
import Shard from "./Shard";
import _errorsModule from "../errors";

const { Error, TypeError, RangeError } = _errorsModule;
import type {
  MultipleShardRespawnOptions,
  MultipleShardSpawnOptions,
  ShardingManagerMode,
  ShardingManagerOptions,
} from "../../typings";
import type { Client } from "../client/Client";
import type { ShardIPCMessage } from "./Shard";

interface BroadcastEvalOptions {
  shard?: number;
  context?: unknown;
}

/**
 * This is a utility class that makes multi-process sharding of a bot an easy and painless experience.
 * It works by spawning a self-contained {@link ChildProcess} or {@link Worker} for each individual shard, each
 * containing its own instance of your bot's {@link Client}. They all have a line of communication with the master
 * process, and there are several useful methods that utilize it in order to simplify tasks that are normally difficult
 * with sharding. It can spawn a specific number of shards or the amount that Discord suggests for the bot, and takes a
 * path to your main bot script to launch for each one.
 * @extends {EventEmitter}
 * @deprecated
 */
class ShardingManager extends EventEmitter {
  file: string;
  shardList: number[] | "auto";
  totalShards: number | "auto";
  mode: ShardingManagerMode;
  respawn: boolean;
  shardArgs: string[];
  execArgv: string[];
  token: string | null;
  shards: Collection<number, Shard>;

  constructor(file: string, options: ShardingManagerOptions = {}) {
    super();
    const {
      totalShards = "auto",
      shardList = "auto",
      mode = "process",
      respawn = true,
      shardArgs = [],
      execArgv = [],
      token = process.env.DISCORD_TOKEN,
    } = options;

    this.file = file;
    if (!file) {
      throw new Error("CLIENT_INVALID_OPTION", "File", "specified.");
    }
    if (!path.isAbsolute(file)) {
      this.file = path.resolve(process.cwd(), file);
    }
    const stats = fs.statSync(this.file);
    if (!stats.isFile()) {
      throw new Error("CLIENT_INVALID_OPTION", "File", "a file");
    }

    this.shardList = shardList;
    if (this.shardList !== "auto") {
      if (!Array.isArray(this.shardList)) {
        throw new TypeError("CLIENT_INVALID_OPTION", "shardList", "an array.");
      }
      this.shardList = [...new Set(this.shardList)];
      if (this.shardList.length < 1) {
        throw new RangeError(
          "CLIENT_INVALID_OPTION",
          "shardList",
          "at least 1 id."
        );
      }
      if (
        this.shardList.some(
          (shardId) =>
            typeof shardId !== "number" ||
            Number.isNaN(shardId) ||
            !Number.isInteger(shardId) ||
            shardId < 0
        )
      ) {
        throw new TypeError(
          "CLIENT_INVALID_OPTION",
          "shardList",
          "an array of positive integers."
        );
      }
    }

    this.totalShards = totalShards;
    if (this.totalShards !== "auto") {
      if (
        typeof this.totalShards !== "number" ||
        Number.isNaN(this.totalShards)
      ) {
        throw new TypeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "a number."
        );
      }
      if (this.totalShards < 1) {
        throw new RangeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "at least 1."
        );
      }
      if (!Number.isInteger(this.totalShards)) {
        throw new RangeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "an integer."
        );
      }
    }

    this.mode = mode;
    if (this.mode !== "process" && this.mode !== "worker") {
      throw new RangeError(
        "CLIENT_INVALID_OPTION",
        "Sharding mode",
        '"process" or "worker"'
      );
    }

    this.respawn = respawn;

    this.shardArgs = shardArgs;

    this.execArgv = execArgv;

    this.token = token?.replace(/^Bot\s*/i, "") ?? null;

    this.shards = new Collection();

    process.env.SHARDING_MANAGER = "true";
    process.env.SHARDING_MANAGER_MODE = this.mode;
    if (this.token) {
      process.env.DISCORD_TOKEN = this.token;
    } else {
      delete process.env.DISCORD_TOKEN;
    }
  }

  createShard(id = this.shards.size): Shard {
    const shard = new Shard(this, id);
    this.shards.set(id, shard);
    this.emit("shardCreate", shard);
    return shard;
  }

  async spawn({
    amount = this.totalShards,
    delay = 5500,
    timeout = 30_000,
  }: MultipleShardSpawnOptions = {}): Promise<Collection<number, Shard>> {
    // Obtain/verify the number of shards to spawn
    if (amount === "auto") {
      amount = 1;
    } else {
      if (typeof amount !== "number" || Number.isNaN(amount)) {
        throw new TypeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "a number."
        );
      }
      if (amount < 1) {
        throw new RangeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "at least 1."
        );
      }
      if (!Number.isInteger(amount)) {
        throw new TypeError(
          "CLIENT_INVALID_OPTION",
          "Amount of shards",
          "an integer."
        );
      }
    }

    // Make sure this many shards haven't already been spawned
    if (this.shards.size >= amount) {
      throw new Error("SHARDING_ALREADY_SPAWNED", this.shards.size);
    }
    if (
      this.shardList === "auto" ||
      this.totalShards === "auto" ||
      this.totalShards !== amount
    ) {
      this.shardList = [...Array(amount).keys()];
    }
    if (this.totalShards === "auto" || this.totalShards !== amount) {
      this.totalShards = amount;
    }

    if (this.shardList.some((shardId) => shardId >= amount)) {
      throw new RangeError(
        "CLIENT_INVALID_OPTION",
        "Amount of shards",
        "bigger than the highest shardId in the shardList option."
      );
    }

    // Spawn the shards
    for (const shardId of this.shardList) {
      const promises: Promise<unknown>[] = [];
      const shard = this.createShard(shardId);
      promises.push(shard.spawn(timeout));
      if (delay > 0 && this.shards.size !== this.shardList.length) {
        promises.push(Bun.sleep(delay));
      }
      await Promise.all(promises); // eslint-disable-line no-await-in-loop
    }

    return this.shards;
  }

  broadcast(message: ShardIPCMessage): Promise<Shard[]> {
    const promises: Promise<Shard>[] = [];
    for (const shard of this.shards.values()) {
      promises.push(shard.send(message));
    }
    return Promise.all(promises);
  }

  async broadcastEval<T>(fn: (client: Client) => T): Promise<T[]>;
  async broadcastEval<T>(
    fn: (client: Client) => T,
    options: { shard: number }
  ): Promise<T>;
  async broadcastEval<T, P>(
    fn: (client: Client, context: P) => T,
    options: { context: P }
  ): Promise<T[]>;
  async broadcastEval<T, P>(
    fn: (client: Client, context: P) => T,
    options: { context: P; shard: number }
  ): Promise<T>;
  async broadcastEval(
    script: (client: Client, context?: unknown) => unknown,
    options: BroadcastEvalOptions = {}
  ): Promise<unknown> {
    if (typeof script !== "function") {
      throw new TypeError("SHARDING_INVALID_EVAL_BROADCAST");
    }
    return this._performOnShards(
      "eval",
      [`(${script})(this, ${JSON.stringify(options.context)})`],
      options.shard
    );
  }

  fetchClientValues(prop: string): Promise<unknown[]>;
  fetchClientValues(prop: string, shard?: number): Promise<unknown>;
  fetchClientValues(prop: string, shard?: number): Promise<unknown> {
    return this._performOnShards("fetchClientValue", [prop], shard);
  }

  _performOnShards(
    method: "eval" | "fetchClientValue",
    args: unknown[],
    shard?: number
  ): Promise<unknown> {
    if (this.shards.size === 0) {
      throw new Error("SHARDING_NO_SHARDS");
    }

    if (typeof shard === "number") {
      const target = this.shards.get(shard);
      if (!target) {
        throw new Error("SHARDING_SHARD_NOT_FOUND", shard);
      }
      const fn = Reflect.get(target, method);
      if (typeof fn !== "function") {
        throw new Error("SHARDING_SHARD_NOT_FOUND", shard);
      }
      return Reflect.apply(fn, target, args);
    }

    if (
      this.shardList === "auto" ||
      this.shards.size !== this.shardList.length
    ) {
      throw new Error("SHARDING_IN_PROCESS");
    }

    const promises: Promise<unknown>[] = [];
    for (const sh of this.shards.values()) {
      const fn = Reflect.get(sh, method);
      if (typeof fn === "function") {
        promises.push(Reflect.apply(fn, sh, args));
      }
    }
    return Promise.all(promises);
  }

  async respawnAll({
    shardDelay = 5000,
    respawnDelay = 500,
    timeout = 30_000,
  }: MultipleShardRespawnOptions = {}): Promise<Collection<number, Shard>> {
    let s = 0;
    for (const shard of this.shards.values()) {
      const promises: Promise<unknown>[] = [
        shard.respawn({ delay: respawnDelay, timeout }),
      ];
      if (++s < this.shards.size && shardDelay > 0) {
        promises.push(Bun.sleep(shardDelay));
      }
      await Promise.all(promises); // eslint-disable-line no-await-in-loop
    }
    return this.shards;
  }
}

export default ShardingManager;
export { ShardingManager };
