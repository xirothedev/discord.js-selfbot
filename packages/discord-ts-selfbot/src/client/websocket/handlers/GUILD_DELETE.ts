export = (client: any, packet: any) => {
  client.actions.GuildDelete.handle(packet.d);
};
