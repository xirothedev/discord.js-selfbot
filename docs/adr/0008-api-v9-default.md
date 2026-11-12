# Default to API v9 for official client parity

**Status:** Accepted

Discord documents API v9 as the default for the official client. API v10 is also available. The library changed its default from v9 to v10 on 2026-11-11 after the live comparison in `docs/plans/v10-upgradeability.md`. That comparison found no route or payload difference in the sampled set.

A captured request from the current Windows desktop client uses `/api/v9` and client build `1.0.9267`. The library still used v10 and the older `1.0.9210` build properties. The team wants the request signature to match the official client. Detection avoidance is a hypothesis, not a guarantee.

## Decision

- Default `http.version` and `ws.version` to `9`.
- Keep both options configurable. Callers can pin v10.
- Update the values of client property fields that already exist to the captured desktop client: client version `1.0.9267`, build `667580`, native build `97793`, Electron `44.10.0`, Chrome `152.0.7977.169`, and Windows `10.0.26200`.
- Do not add fields that the library does not already send. This keeps `x-installation-id`, `os_version_is_release`, and `os_build_revision` out of scope.
- Do not add a new client properties module. Keep the change small and update the existing constants.
- Do not change the package version for this change.

## Consequences

- A user token now calls the same API version as the official client.
- v10 remains available as an explicit option.
- The stale build values are gone. The remaining differences are documented gaps: installation ID, the two missing super-properties fields, gateway `capabilities`, `client_state`, HTTP version, TLS fingerprint, and header order.
- `origin` stays on every request, including GET. The captured GET has no `origin`. This is a known gap.
- The timezone stays host-derived. A caller can override `x-discord-timezone` through `http.headers`.
- No change guarantees that Discord will not detect automation. The Terms of Service still prohibit selfbots.
- If Discord announces a v9 shutdown, flip the default back to v10 and update this ADR.

## References

- `docs/plans/v10-upgradeability.md` — live v9/v10 comparison and the earlier recommendation.
- Discord API versions: <https://docs.discord.food/reference#api-versions>
- Client properties: <https://docs.discord.food/reference#client-properties>
