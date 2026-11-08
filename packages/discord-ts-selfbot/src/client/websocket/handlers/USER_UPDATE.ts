export = (client: any, packet: any) => {
  client.actions.UserUpdate.handle(packet.d);
};
