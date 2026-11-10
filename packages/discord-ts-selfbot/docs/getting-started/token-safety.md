# Token safety

## What the token is

A selfbot authenticates as your **user account**. The token is a full-access credential: anyone who has it can read your messages, send messages as you, change your profile, and manage your relationships. It is not a bot token and it does not have a permission scope you can narrow.

> **Discord Terms of Service**
>
> Automating a user account is against Discord's Terms of Service. Discord can suspend or terminate the
> account. The library is provided for educational use, without any guarantee that an account will survive.

## Store it in the environment

Never put a token in source code, a screenshot, a commit, or a chat message.

```sh
# .env — never commit this file
DISCORD_TOKEN=your-user-token
```

```ts
const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error('Set DISCORD_TOKEN before starting the client.');
}
```

Add the file to `.gitignore` before the first commit:

```text
.env
.env.*
!.env.example
```

Use a secret manager or your shell environment for production. Do not pass the token as a command-line argument; process lists are visible to other users on the machine.

## Use a dedicated account

The safest setup is an account you are willing to lose. Do not use an account that owns servers, payment methods, Nitro credit, or personal conversations you cannot replace.

## If a token leaks

1. Change the account password.
2. Log out of all sessions in Discord settings.
3. Review authorized applications and remove anything you do not recognize.
4. Check recent messages and friend requests for activity you did not perform.

Changing the password invalidates the token. Rotating an environment variable is not enough if the old token is still valid.

## What the library does with the token

`Client#login` sends the token to Discord over HTTPS and stores it on the client instance for reconnects. The fake test server in `packages/test-harness` never needs a real token. Tests use a placeholder and a local HTTP/WebSocket server.

## Related

- [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety)
- [First client](first-client.md)
- [Discord Terms of Service](https://discord.com/terms)
