# WidgetManager

Manages profile widgets and widget configuration reads for the current user.

```ts

class WidgetManager extends BaseManager

```

## Properties

### `client`

**Type:** `Client` · **Modifiers:** readonly

## Methods

### `fetchDeveloperConfigs`

Fetches widget configs for applications the user can access.

```ts

fetchDeveloperConfigs(): Promise<RawDeveloperWidgetConfigsData>

```

**Returns:** `Promise<RawDeveloperWidgetConfigsData>`

### `fetchFeaturedConfigs`

Fetches featured application widget configs.

```ts

fetchFeaturedConfigs(): Promise<RawFeaturedWidgetConfigsData>

```

**Returns:** `Promise<RawFeaturedWidgetConfigsData>`

### `fetchLayoutDefinitions`

Fetches the widget layout definitions.

```ts

fetchLayoutDefinitions(): Promise<RawWidgetLayoutDefinitionsData>

```

**Returns:** `Promise<RawWidgetLayoutDefinitionsData>`

### `fetchSuggestedGames`

Fetches suggested games for the current user's profile widgets.

```ts

fetchSuggestedGames(): Promise<RawSuggestedWidgetGamesData>

```

**Returns:** `Promise<RawSuggestedWidgetGamesData>`

### `setProfileWidgets`

Replaces the current user's profile widgets.

```ts

setProfileWidgets(widgets: RawGameWidgetData[]): Promise<RawProfileWidgetsData>

```

- `widgets: RawGameWidgetData[]`

**Returns:** `Promise<RawProfileWidgetsData>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/WidgetManager.ts#L1
