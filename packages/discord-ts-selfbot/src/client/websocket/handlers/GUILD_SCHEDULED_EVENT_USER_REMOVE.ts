export = (client: any, packet: any) => {
  client.actions.GuildScheduledEventUserRemove.handle(packet.d);
};
