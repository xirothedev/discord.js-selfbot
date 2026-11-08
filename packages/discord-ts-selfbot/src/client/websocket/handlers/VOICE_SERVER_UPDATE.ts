export = (client: any, packet: any) => {
  client.emit('debug', `[VOICE] received voice server: ${JSON.stringify(packet)}`);
  client.voice.onVoiceServer(packet.d);
};
