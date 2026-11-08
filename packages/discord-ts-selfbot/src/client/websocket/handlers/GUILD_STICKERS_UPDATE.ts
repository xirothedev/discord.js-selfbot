export = (client: any, packet: any) => {
  client.actions.GuildStickersUpdate.handle(packet.d);
};
