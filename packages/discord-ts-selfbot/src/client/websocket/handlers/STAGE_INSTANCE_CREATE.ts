export = (client: any, packet: any) => {
  client.actions.StageInstanceCreate.handle(packet.d);
};
