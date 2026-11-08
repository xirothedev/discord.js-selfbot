export = (client: any, packet: any) => {
  client.actions.GuildScheduledEventUserAdd.handle(packet.d);
};
