export = (client: any, packet: any) => {
  client.actions.ChannelDelete.handle(packet.d);
};
