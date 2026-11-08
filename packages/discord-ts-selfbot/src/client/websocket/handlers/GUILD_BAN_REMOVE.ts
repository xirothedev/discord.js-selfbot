export = (client: any, packet: any) => {
  client.actions.GuildBanRemove.handle(packet.d);
};
