export = (client: any, packet: any) => {
  client.actions.ApplicationCommandPermissionsUpdate.handle(packet.d);
};
