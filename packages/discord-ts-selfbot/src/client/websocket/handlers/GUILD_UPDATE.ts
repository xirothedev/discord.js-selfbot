export = (client: any, packet: any) => {
  client.actions.GuildUpdate.handle(packet.d);
};
