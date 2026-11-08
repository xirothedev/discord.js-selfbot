export = (client: any, packet: any) => {
  client.actions.StageInstanceDelete.handle(packet.d);
};
