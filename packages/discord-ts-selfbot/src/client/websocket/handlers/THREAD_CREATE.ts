export = (client: any, packet: any) => {
  client.actions.ThreadCreate.handle(packet.d);
};
