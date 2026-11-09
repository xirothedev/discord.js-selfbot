import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
// Data structure that makes it easy to interact with a bitfield.

type BitFieldResolvable = number | string | bigint | BitField | BitFieldResolvable[];

class BitField {
  static FLAGS: Record<string, number | bigint> = {};
  static defaultBit: number | bigint = 0;

  bitfield: number | bigint;

  constructor(bits: BitFieldResolvable = (this.constructor as any).defaultBit) {
    this.bitfield = (this.constructor as any).resolve(bits) as number | bigint;
  }

  any(bit: BitFieldResolvable): boolean {
    return ((this.bitfield as any) & (this.constructor as any).resolve(bit)) !== (this.constructor as any).defaultBit;
  }

  equals(bit: BitFieldResolvable): boolean {
    return this.bitfield === (this.constructor as any).resolve(bit);
  }

  has(bit: BitFieldResolvable, ..._hasParams: any[]): boolean {
    bit = (this.constructor as any).resolve(bit) as any;
    return ((this.bitfield as any) & (bit as any)) === (bit as any);
  }

  missing(bits: BitFieldResolvable, ...hasParams: any[]): string[] {
    return new (this.constructor as any)(bits).remove(this).toArray(...hasParams);
  }

  freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  add(...bits: BitFieldResolvable[]): this {
    let total: any = (this.constructor as any).defaultBit;
    for (const bit of bits) {
      total |= (this.constructor as any).resolve(bit);
    }
    if (Object.isFrozen(this)) return new (this.constructor as any)((this.bitfield as any) | total) as this;
    this.bitfield = (this.bitfield as any) | total;
    return this;
  }

  remove(...bits: BitFieldResolvable[]): this {
    let total: any = (this.constructor as any).defaultBit;
    for (const bit of bits) {
      total |= (this.constructor as any).resolve(bit);
    }
    if (Object.isFrozen(this)) return new (this.constructor as any)((this.bitfield as any) & ~total) as this;
    this.bitfield = (this.bitfield as any) & ~total;
    return this;
  }

  serialize(...hasParams: any[]): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries((this.constructor as any).FLAGS)) {
      serialized[flag] = this.has(bit as any, ...(hasParams as any[]));
    }
    return serialized;
  }

  toArray(...hasParams: any[]): string[] {
    return Object.keys((this.constructor as any).FLAGS).filter(bit => this.has(bit as any, ...(hasParams as any[])));
  }

  toJSON(): number | string {
    return typeof this.bitfield === 'number' ? this.bitfield : this.bitfield.toString();
  }

  valueOf(): number | bigint {
    return this.bitfield;
  }

  *[Symbol.iterator](): Generator<string> {
    yield* this.toArray();
  }

  static resolve(bit: BitFieldResolvable): number | bigint {
    const self = this as any;
    const { defaultBit } = self;
    if (typeof defaultBit === typeof bit && bit >= defaultBit) return bit as number | bigint;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit.map((p: any) => self.resolve(p)).reduce((prev: any, p: any) => prev | p, defaultBit);
    if (typeof bit === 'string') {
      if (!isNaN(Number(bit))) return typeof defaultBit === 'bigint' ? BigInt(bit) : Number(bit);
      if (self.FLAGS[bit] !== undefined) return self.FLAGS[bit];
    }
    throw new RangeError('BITFIELD_INVALID', bit);
  }
}

export default BitField;
export { BitField };
