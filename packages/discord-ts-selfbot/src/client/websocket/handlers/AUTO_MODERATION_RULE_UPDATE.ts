export = (client: any, packet: any) => {
  client.actions.AutoModerationRuleUpdate.handle(packet.d);
};
