import type { APIGuildMember, APIUser } from 'discord-api-types/v10';

/**
 * The partial shape that `GuildMember._patch` accepts.
 *
 * `RawGuildMemberData` is a union that includes `{ user: { id } }`; the patch
 * type keeps that narrow variant while exposing the normal member fields.
 */
export type GuildMemberPatch = Omit<Partial<APIGuildMember>, 'user'> & { user?: APIUser | { id: string } };
