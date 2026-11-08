export = (client: any, packet: any) => {
  client.actions.MessageDelete.handle(packet.d);
};
