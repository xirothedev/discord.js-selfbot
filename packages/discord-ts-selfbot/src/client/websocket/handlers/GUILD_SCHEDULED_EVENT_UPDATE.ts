export = (client: any, packet: any) => {
  client.actions.GuildScheduledEventUpdate.handle(packet.d);
};
