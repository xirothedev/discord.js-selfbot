export = (client: any, packet: any) => {
  client.actions.GuildBanAdd.handle(packet.d);
};
