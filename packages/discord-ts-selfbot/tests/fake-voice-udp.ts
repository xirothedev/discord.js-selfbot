import { EventEmitter } from 'node:events';

class FakeVoiceUdp extends EventEmitter {
  constructor(connection) {
    super();
    this.connection = connection;
    this.addresses = [];
    this.shutdownCalls = 0;
  }

  createUDPSocket(address) {
    this.addresses.push(address);
  }

  send(packet) {
    return Promise.resolve(packet);
  }

  shutdown() {
    this.shutdownCalls += 1;
  }
}

export default FakeVoiceUdp;
