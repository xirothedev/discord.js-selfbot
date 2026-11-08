export = (client: any, packet: any) => {
  client.actions.GuildRoleUpdate.handle(packet.d);
};
