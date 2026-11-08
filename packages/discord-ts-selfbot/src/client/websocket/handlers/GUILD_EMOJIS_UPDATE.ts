export = (client: any, packet: any) => {
  client.actions.GuildEmojisUpdate.handle(packet.d);
};
