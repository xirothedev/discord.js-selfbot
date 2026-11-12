# Account and profile

## Presence and status

```ts
import { CustomStatus, Events } from '@discord-selfbot/core';

client.once(Events.CLIENT_READY, (readyClient) => {
  readyClient.user.setPresence({
    status: 'online',
    afk: false,
    activities: [new CustomStatus(readyClient).setEmoji('🎮').setState('@discord-selfbot/core')],
  });
});
```

`setStatus('idle' | 'dnd' | 'online' | 'invisible')` is a shortcut for a plain status. `setPresence` accepts a full presence object, including activities.

## Edit the profile

```ts
await client.user.setAboutMe('Bun-first selfbot.');
client.user.setPronouns('they/them');
client.user.setGlobalName('Bun');

await client.user.setBanner('https://example.com/banner.png');
client.user.setAccentColor('#5865F2');
client.user.setHypeSquad('BRAVERY');
```

The profile methods change the account, not a guild member. They require no bot permissions, but they do change how the account appears to everyone.

## Samsung activity

```ts
await client.user.setSamsungActivity('com.samsung.android.game.gamehome', 'START');
await client.user.setSamsungActivity('com.samsung.android.game.gamehome', 'STOP');
```

This sets the Samsung Game Launcher activity. It is a selfbot-only extension.

## Burst credit

```ts
const credit = await client.user.fetchBurstCredit();
console.log(credit);
```

The response shape is whatever Discord returns for the burst-credit endpoint. Treat it as an opaque object.

## Friend invites

```ts
const invite = await client.user.createFriendInvite();
const all = await client.user.getAllFriendInvites();
await client.user.revokeAllFriendInvites();
```

- `createFriendInvite()` posts an empty body to `/users/@me/invites`.
- `getAllFriendInvites()` returns a collection keyed by invite code.
- `revokeAllFriendInvites()` deletes every friend invite.

## Stop ringing

```ts
await client.user.stopRinging(channel);
```

Stops an outgoing call ring for a DM or group DM channel.

## Connections

```ts
const connections = await client.user.fetchConnections();

for (const connection of connections.values()) {
  console.log(connection.type, connection.name, connection.verified);
}
```

`fetchConnections()` returns a collection keyed by connection id. It removes the `access_token` field on purpose. Do not request or log that field.

## Application role connections

```ts
import { OAuth2RoleConnection } from '@discord-selfbot/core';

const roleConnection = new OAuth2RoleConnection(client, oauthToken);
await roleConnection.fetch(applicationId);
await roleConnection.update(applicationId, {
  platformName: 'Steam',
  platformUsername: 'octocat',
  metadata: { level: '10' },
});
```

The helper takes an OAuth2 access token with the `role_connections.write` scope. The normal client token does not work. Keep the token in memory and never log it.

## Profile badges and widgets

```ts
const profile = await client.user.getProfile({ guildId: guild.id });

for (const badge of profile.badges ?? []) {
  console.log(badge.id, badge.description);
}
```

`getProfile()` returns the raw profile payload, including `badges`, `guild_badges`, `widgets`, and `user_profile`. The shape is undocumented and can change. The method accepts a guild id or a `UserProfileOptions` object.

## Profile widgets

```ts
await client.widgets.setProfileWidgets([
  { data: { type: 'favorite_games', games: [{ game_id: '123' }] } },
]);

const suggested = await client.widgets.fetchSuggestedGames();
const featured = await client.widgets.fetchFeaturedConfigs();
```

`setProfileWidgets()` replaces the full list. It rejects duplicate widget types and ignores `updated_at`. An empty array clears the list.

## User application identities

```ts
const identities = await client.user.fetchApplicationIdentities({
  withProfiles: true,
});
await client.user.setApplicationIdentityConfig(applicationId, externalUserId, {
  connectionVisible: '1',
});
```

These routes are undocumented. `connection_visible` is a string.

## Risky mutations are stubbed

These methods exist in the typings but reject without making a request:

- `RelationshipManager#addFriend`
- `RelationshipManager#deleteRelationship`
- `RelationshipManager#sendFriendRequest`
- `RelationshipManager#addBlocked`

They are marked `@deprecated` and `@experimental`. Do not build automation around them until a separate safety review lands. See [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety).

## Next

- [Guilds](guilds.md)
- [API: ClientUser](../reference/structures/client-user.md)
- [API: RelationshipManager](../reference/managers/relationship-manager.md)
