# Application

Represents an OAuth2 Application.

```ts

abstract class Application extends Base

```

## Properties

### `aliases`

Other names the application's game is associated with

**Type:** `string[]`

### `approximateGuildCount`

An approximate amount of guilds this application is in.

**Type:** `number | null`

### `approximateUserAuthorizationCount`

Approximate count of users that have OAuth2 authorizations for the application

**Type:** `number | null`

### `approximateUserInstallCount`

Approximate count of users that have authorized the application with the applications.commands scope

**Type:** `number | null`

### `bot`

The bot attached to this application

**Type:** `PartialUser | null`

### `botDisabled`

Whether the application's bot is disabled by Discord (default false)

**Type:** `boolean | null`

### `botPublic`

If this application's bot is public

**Type:** `boolean | null`

### `botQuarantined`

Whether the application's bot is quarantined by Discord

**Type:** `boolean | null`

### `botRequireCodeGrant`

If this application's bot requires a code grant when using the OAuth2 flow

**Type:** `boolean | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `commands`

**Type:** `ApplicationCommandManager`

### `cover`

The hash of the application's cover image

**Type:** `string | null`

### `createdAt`

The time the application was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the application was created at

**Type:** `number` · **Modifiers:** readonly

### `creatorMonetizationState`

The current guild creator monetization state of the application

**Type:** `number | null`

### `customInstallURL`

This application's custom installation URL

**Type:** `string | null`

### `deeplinkUri`

The URL used for deep linking during OAuth2 authorization on mobile devices

**Type:** `string | null`

### `description`

The application's description

**Type:** `string | null`

### `developers`

The companies that developed the application

**Type:** `{ id: string; name: string }[] | null`

### `discoverabilityState`

The current application directory discoverability state of the application

**Type:** `number | null`

### `discoveryEligibilityFlags`

The current application directory eligibility flags for the application

**Type:** `number | null`

### `eulaId`

The ID of the application's EULA

**Type:** `string | null`

### `eventWebhooksStatus`

Whether event webhooks are enabled

**Type:** `number | null`

### `eventWebhooksTypes`

The enabled event webhook types to send to the event webhooks endpoint

**Type:** `string[] | null`

### `eventWebhooksUrl`

The URL of the application's event webhooks endpoint

**Type:** `string | null`

### `executables`

The unique executables of the application's game

**Type:** `{ is_launcher: boolean; name: string; os: string }[] | null`

### `explicitContentFilter`

Whether uploaded media content used in application commands is scanned and deleted for explicit content

**Type:** `number | null`

### `flags`

The flags this application has

**Type:** `Readonly<ApplicationFlags>`

### `guild`

The guild associated with this application.

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The id of the guild associated with this application.

**Type:** `string | null`

### `hook`

Whether the Discord client is allowed to hook into the application's game directly

**Type:** `boolean | null`

### `icon`

The application's icon hash

**Type:** `string | null`

### `id`

The application's id

**Type:** `string`

### `installParams`

**Type:** `ClientApplicationInstallParams | null`

### `integrationPublic`

Whether only the application owner can add the integration

**Type:** `boolean | null`

### `integrationRequireCodeGrant`

Whether the integration will only be added upon completion of a full OAuth2 token exchange

**Type:** `boolean | null`

### `integrationTypesConfig`

The configuration for each integration type supported by the application

**Type:** `Record<number, { oauth2_install_params: ClientApplicationInstallParams | null }> | null`

### `interactionsEndpointUrl`

The URL of the application's interactions endpoint

**Type:** `string | null`

### `interactionsEventTypes`

The enabled event webhook types to send to the interaction endpoint

**Type:** `string[] | null`

### `interactionsVersion`

The version of the application's interactions endpoint implementation

**Type:** `number | null`

### `internalGuildRestriction`

What guilds the application can be authorized in

**Type:** `number | null`

### `isDiscoverable`

Whether the application is discoverable in the application directory

**Type:** `boolean | null`

### `isMonetized`

Whether the application has monetization enabled

**Type:** `boolean | null`

### `isVerified`

Whether the application is verified

**Type:** `boolean | null`

### `maxParticipants`

The maximum possible participants in the application's embedded activity (-1 for no limit)

**Type:** `number | null`

### `monetizationEligibilityFlags`

The current application monetization eligibility flags for the application

**Type:** `number | null`

### `monetizationState`

The current application monetization state of the application

**Type:** `number | null`

### `name`

The name of the application

**Type:** `string | null`

### `overlay`

Whether the application's game supports the Discord overlay (default false)

**Type:** `boolean | null`

### `overlayCompatibilityHook`

Whether to use the compatibility hook for the overlay (default false)

**Type:** `boolean | null`

### `overlayMethods`

The methods of overlaying that the application's game supports

**Type:** `number | null`

### `overlayWarn`

Whether the Discord overlay is known to be problematic with this application's game (default false)

**Type:** `boolean | null`

### `owner`

The owner of this OAuth application

**Type:** `User | Team | null`

### `partial`

Whether this application is partial

**Type:** `boolean` · **Modifiers:** readonly

### `primarySkuId`

The ID of the application's primary SKU (game, application subscription, etc.)

**Type:** `string | null`

### `privacyPolicyURL`

The URL of the application's privacy policy

**Type:** `string | null`

### `publishers`

The companies that published the application

**Type:** `{ id: string; name: string }[] | null`

### `redirectUris`

The whitelisted URLs for redirecting to during OAuth2 authorization (max 10)

**Type:** `string[] | null`

### `roleConnectionsVerificationURL`

This application's role connection verification entry point URL

**Type:** `string | null`

### `rpcApplicationState`

The current RPC approval state of the application

**Type:** `number | null`

### `rpcOrigins`

The application's RPC origins, if enabled

**Type:** `string[]`

### `slug`

The URL slug that links to the primary store page of the application

**Type:** `string | null`

### `splash`

The application's splash image hash

**Type:** `string | null`

### `storeApplicationState`

The current store approval state of the commerce application

**Type:** `number | null`

### `storefrontAvailable`

Whether the application has public subscriptions or products available for purchase

**Type:** `boolean | null`

### `tags`

The tags this application has (max of 5)

**Type:** `string[]`

### `termsOfServiceURL`

The URL of the application's terms of service

**Type:** `string | null`

### `thirdPartySkus`

The third party SKUs of the application's game

**Type:** `{ distributor: string; id: string | null; sku: string | null }[] | null`

### `type`

The type of the application

**Type:** `ApplicationType | null`

### `verificationState`

The current verification state of the application

**Type:** `number | null`

### `verifyKey`

The hex-encoded key for verification in interactions and the GameSDK's GetTicket

**Type:** `string | null`

## Methods

### `coverURL`

A link to this application's cover image.

```ts

coverURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `fetch`

Obtains this application from Discord.

```ts

fetch(): Promise<Application>

```

**Returns:** `Promise<Application>`

### `fetchAssets`

Gets the application's rich presence assets.

> **Deprecated.** This method is deprecated as it is unsupported and will be removed in the next major version.

```ts

fetchAssets(): Promise<ApplicationAsset[]>

```

**Returns:** `Promise<ApplicationAsset[]>`

### `fetchRoleConnectionMetadataRecords`

Gets this application's role connection metadata records

```ts

fetchRoleConnectionMetadataRecords(): Promise<ApplicationRoleConnectionMetadata[]>

```

**Returns:** `Promise<ApplicationRoleConnectionMetadata[]>`

### `iconURL`

A link to the application's icon.

```ts

iconURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string | null

```

**Returns:** `string | null`

```ts
// Logs: Application name: My App
console.log(`Application name: ${application}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/interfaces/Application.ts#L33
