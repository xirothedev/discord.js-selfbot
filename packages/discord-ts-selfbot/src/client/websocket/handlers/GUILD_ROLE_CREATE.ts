export = (client: any, packet: any) => {
  client.actions.GuildRoleCreate.handle(packet.d);
};
