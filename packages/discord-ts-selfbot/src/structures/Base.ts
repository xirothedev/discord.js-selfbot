import Util from '../util/Util';
import type { Client } from '../client/Client';

class Base {
  declare client: Client;

  constructor(client: Client) {
    Object.defineProperty(this, 'client', { value: client });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: unknown) {
    return data;
  }

  _update(data: unknown) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props: unknown[]) {
    return Util.flatten(this, ...props);
  }

  valueOf(): string {
    return 'id' in this && typeof this.id === 'string' ? this.id : '';
  }
}

export default Base;
export { Base };
