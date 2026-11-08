export = (client: any, packet: any) => {
  client.actions.GuildRoleDelete.handle(packet.d);
};
