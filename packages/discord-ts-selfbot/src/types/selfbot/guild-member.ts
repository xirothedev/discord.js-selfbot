import type { APIGuildMember, APIUser } from "discord-api-types/v10";

export type GuildMemberPatch = Omit<Partial<APIGuildMember>, "user"> & {
  user?: APIUser | { id: string };
};
