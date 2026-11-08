export = (client: any, packet: any) => {
  client.actions.AutoModerationRuleDelete.handle(packet.d);
};
