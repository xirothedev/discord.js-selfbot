# Options

Contains various utilities for client options.

```ts

class Options extends any

```

## Properties

### `defaultMakeCacheSettings`

The default settings passed to ClientOptions.makeCache.
The caches that this changes are:
* `MessageManager` - Limit to 200 messages
* `ChannelManager` - Sweep archived threads
* `GuildChannelManager` - Sweep archived threads
* `ThreadManager` - Sweep archived threads
If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
`makeCache: Options.cacheWithLimits({ ...Options.defaultMakeCacheSettings, ReactionManager: 0 })`

**Type:** `CacheWithLimitsOptions` · **Modifiers:** static

### `defaultSweeperSettings`

The default settings passed to ClientOptions.sweepers.
The sweepers that this changes are:
* `threads` - Sweep archived threads every hour, removing those archived more than 4 hours ago
If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
`sweepers: { ...Options.defaultSweeperSettings, messages: { interval: 300, lifetime: 600 } }`

**Type:** `SweeperOptions` · **Modifiers:** static

## Methods

### `cacheEverything`

Create a cache factory that always caches everything.

```ts

static cacheEverything(): CacheFactory

```

**Returns:** `CacheFactory`

### `cacheWithLimits`

Create a cache factory using predefined settings to sweep or limit.

```ts

static cacheWithLimits(settings?: CacheWithLimitsOptions): CacheFactory

```

- `settings?: CacheWithLimitsOptions` — Settings passed to the relevant constructor. If no setting is provided for a manager, it uses Collection. If a number is provided for a manager, it uses that number as the max size for a LimitedCollection. If LimitedCollectionOptions are provided for a manager, it uses those settings to form a LimitedCollection.

**Returns:** `CacheFactory`

```ts
// Store up to 200 messages per channel and discard archived threads if they were archived more than 4 hours ago.
// Note archived threads will remain in the guild and client caches with these settings
Options.cacheWithLimits({
   MessageManager: 200,
   ThreadManager: {
     sweepInterval: 3600,
     sweepFilter: LimitedCollection.filterByLifetime({
       getComparisonTimestamp: e => e.archiveTimestamp,
       excludeFromSweep: e => !e.archived,
     }),
   },
 });
```

```ts
// Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 30 minutes
Options.cacheWithLimits({
  // Keep default thread sweeping behavior
  ...Options.defaultMakeCacheSettings,
  // Override MessageManager
  MessageManager: {
    sweepInterval: 300,
    sweepFilter: LimitedCollection.filterByLifetime({
      lifetime: 1800,
      getComparisonTimestamp: e => e.editedTimestamp ?? e.createdTimestamp,
    })
  }
});
```

### `createDefault`

The default client options.

```ts

static createDefault(): ClientOptions

```

**Returns:** `ClientOptions`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Options.ts#L16
