# Security Policy

## Supported versions

Only the latest release on `main` receives security fixes.

## Reporting a vulnerability

Please do **not** open a public issue for a security vulnerability.

Report privately via GitHub Security Advisories:
https://github.com/xirothedev/discord.js-selfbot/security/advisories/new

Include:
- A description of the issue and its impact.
- Steps to reproduce or a proof of concept.
- The affected version(s).

You will receive an acknowledgement within 7 days.

## Token safety

This library handles Discord **user tokens**. A user token grants full access to an account.

- Never log, print, or commit a token. Use `Util.redact()` before including any value in logs or error messages.
- Never share tokens in issues, PRs, or chat.
- Rotate a token immediately if it is exposed.

## Supply chain

- Dependencies are pinned via `bun.lock`. CI installs with `--frozen-lockfile`.
- Pull requests are scanned by GitHub CodeQL, Dependabot, TruffleHog, and Socket.dev.
- Report suspicious dependency changes through the same private channel.