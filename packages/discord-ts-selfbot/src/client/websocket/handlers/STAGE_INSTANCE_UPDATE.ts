export = (client: any, packet: any) => {
  client.actions.StageInstanceUpdate.handle(packet.d);
};
