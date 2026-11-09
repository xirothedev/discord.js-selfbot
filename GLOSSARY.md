# Glossary

Domain terms used in this repository. Keep this file free of implementation details, UI tokens, and copy tables; those live in `DESIGN.md`.

## Selfbot

A program that controls a Discord **user account** through the same API that the official client uses. It is not a bot account and has no permission scopes.

## User token

A full-access credential for a Discord user account. It authenticates the selfbot. It is not a bot token.

## Bot token

A credential for a Discord application bot. This library does not accept bot tokens.

## Client

The `Client` instance that owns the gateway connection, REST manager, caches, and voice manager.

## Guild

A Discord server. The API type is `Guild`; user-facing prose may say "server".

## Channel

A guild channel, DM channel, or group DM channel. The API type is `Channel` and its subclasses.

## Structure

A data object backed by the client caches, such as `Message`, `Guild`, `User`, or `Channel`.

## Manager

A cache-backed collection with fetch and mutation methods, such as `GuildManager` or `MessageManager`.

## REST

The HTTP API at `discord.com/api`. The `RESTManager` and request handlers own rate limits, retries, and authentication.

## Gateway

The Discord WebSocket connection. It delivers events such as `MESSAGE_CREATE`, `READY`, and `CALL_CREATE`. The client maps them to `Events` names.

## Voice connection

A `VoiceConnection` created by `ClientVoiceManager#joinChannel`. It owns the voice WebSocket, UDP socket, dispatcher, and receiver.

## Call state

A `CallState` created from `CALL_CREATE`, `CALL_UPDATE`, or `CALL_DELETE`. It describes a DM or group DM call.

## Recorder

A `Recorder` created by `VoiceReceiver#createVideoStream`. It writes incoming RTP media through ffmpeg.

## Parity

The comparison between this fork&apos;s public surface and `discord.js@14.28.1`. The historical audit is in `docs` and in the docs site under Project.

## Test harness

The fake Discord HTTP and WebSocket server in `packages/test-harness`. It lets tests exercise the REST and gateway boundaries without a real token.

## Docs site

The static Fumadocs application in `apps/docs`. It renders guides, examples, project pages, and the generated API reference.

## API reference

The generated docs under `apps/docs/content/docs/api`. It is built from source JSDoc and `typings/index.d.ts`; do not edit the generated MDX by hand.

## Raw data

The JSON object received from the Discord API or gateway for a structure, before it is mapped onto object fields. The public aliases are named `Raw*Data`.

## Entity

The object shape of a structure: the fields the runtime instance holds, named in camelCase.

## Entity schema

The map from an entity name to its raw data type, its entity type, and the provenance of its fields.

## Field provenance

The tag on an entity field: `api` (standard Discord bot API), `selfbot` (user-account only), `internal` (cache or bookkeeping), or `relation` (points at another structure).

## Payload

The outgoing message body assembled by `MessagePayload`. It is not used for inbound JSON; see **Raw data**.
