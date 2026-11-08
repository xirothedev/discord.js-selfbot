export = (client: any, packet: any) => {
  client.actions.AutoModerationRuleCreate.handle(packet.d);
};
