/**
 * Type bridge for runtime exports that the package typings do not declare yet.
 *
 * `discord-ts-selfbot` exports `Events`, `Partials` and `Status` at run time, and
 * `Client#application` is used by `ApplicationCommandManager`, but
 * `typings/index.d.ts` does not include them. This file adds only the members
 * used by the examples. Remove it when the package typings catch up.
 */

import type { Application } from 'discord-ts-selfbot';

declare module 'discord-ts-selfbot' {
  interface Client<Ready extends boolean = boolean> {
    application: Application;
  }

  const Events: {
    readonly ClientReady: 'clientReady';
    readonly CLIENT_READY: 'ready';
    readonly MessageCreate: 'messageCreate';
    readonly Error: 'error';
  };

  const Partials: {
    readonly Channel: number;
    readonly GuildMember: number;
    readonly Message: number;
    readonly Reaction: number;
    readonly ThreadMember: number;
    readonly User: number;
  };

  const Status: {
    readonly [status: number]: string | undefined;
    readonly Ready: number;
    readonly Connecting: number;
    readonly Reconnecting: number;
    readonly Idle: number;
    readonly Nearly: number;
    readonly Disconnected: number;
    readonly WaitingForGuilds: number;
    readonly Identifying: number;
    readonly Resuming: number;
  };
}

export {};
