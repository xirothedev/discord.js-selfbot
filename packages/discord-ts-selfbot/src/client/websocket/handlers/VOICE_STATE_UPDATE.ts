export = (client: any, packet: any) => {
  client.actions.VoiceStateUpdate.handle(packet.d);
};
