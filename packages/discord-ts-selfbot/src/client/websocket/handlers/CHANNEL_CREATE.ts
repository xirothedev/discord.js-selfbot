export = (client: any, packet: any) => {
  client.actions.ChannelCreate.handle(packet.d);
};
