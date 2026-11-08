export = (client: any, packet: any) => {
  client.actions.TypingStart.handle(packet.d);
};
