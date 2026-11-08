export = (client: any, packet: any) => {
  client.actions.GuildScheduledEventCreate.handle(packet.d);
};
