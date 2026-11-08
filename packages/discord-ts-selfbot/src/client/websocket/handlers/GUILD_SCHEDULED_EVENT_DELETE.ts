export = (client: any, packet: any) => {
  client.actions.GuildScheduledEventDelete.handle(packet.d);
};
