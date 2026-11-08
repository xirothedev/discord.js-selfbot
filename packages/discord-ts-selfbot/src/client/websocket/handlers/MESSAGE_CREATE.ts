export = (client: any, packet: any) => {
  client.actions.MessageCreate.handle(packet.d);
};
