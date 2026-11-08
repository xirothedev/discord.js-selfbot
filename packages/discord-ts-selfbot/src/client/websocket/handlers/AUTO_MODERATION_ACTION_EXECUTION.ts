export = (client: any, packet: any) => {
  client.actions.AutoModerationActionExecution.handle(packet.d);
};
