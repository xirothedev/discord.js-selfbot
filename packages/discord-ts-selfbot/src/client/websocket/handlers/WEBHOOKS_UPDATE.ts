export = (client: any, packet: any) => {
  client.actions.WebhooksUpdate.handle(packet.d);
};
