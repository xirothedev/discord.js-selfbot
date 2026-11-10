import { EventEmitter } from 'node:events';

class FakeVoiceWebSocket extends EventEmitter {
  constructor(connection) {
    super();
    this.connection = connection;
    this.connectCalls = 0;
    this.shutdownCalls = 0;
    this.packets = [];
  }

  connect() {
    this.connectCalls += 1;
  }

  sendPacket(packet) {
    this.packets.push(packet);
    return Promise.resolve(packet);
  }

  shutdown() {
    this.shutdownCalls += 1;
  }
}

export default FakeVoiceWebSocket;
