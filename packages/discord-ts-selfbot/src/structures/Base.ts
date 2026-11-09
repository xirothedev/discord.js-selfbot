import Util from '../util/Util';

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 * @abstract
 */
class Base {
  declare client: import('../client/Client').default;
  [key: string]: any;

  constructor(client: any) {
    /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: any) {
    return data;
  }

  _update(data: any) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props: any[]) {
    return Util.flatten(this, ...props);
  }

  valueOf() {
    return this.id;
  }
}

export default Base;
export { Base };
