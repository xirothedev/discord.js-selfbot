import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
// Data structure that makes it easy to interact with a bitfield.

export type BitFieldResolvable = number | string | bigint | BitField | BitFieldResolvable[];

interface BitFieldStatic {
  defaultBit: number | bigint;
  FLAGS: Record<string, number | bigint>;
  resolve(bit: BitFieldResolvable): number | bigint;
}

class BitField {
  static FLAGS: Record<string, number | bigint> = {};
  static defaultBit: number | bigint = 0;

  bitfield: number | bigint;

  constructor(bits: BitFieldResolvable = (this.constructor as unknown as BitFieldStatic).defaultBit) {
    this.bitfield = (this.constructor as unknown as BitFieldStatic).resolve(bits) as number | bigint;
  }

  any(bit: BitFieldResolvable): boolean {
    const lhs = this.bitfield;
    const rhs = (this.constructor as unknown as BitFieldStatic).resolve(bit);
    if (typeof lhs === 'bigint' || typeof rhs === 'bigint') {
      return ((lhs as bigint) & (rhs as bigint)) !== (this.constructor as unknown as BitFieldStatic).defaultBit;
    }
    return ((lhs as number) & (rhs as number)) !== (this.constructor as unknown as BitFieldStatic).defaultBit;
  }

  equals(bit: BitFieldResolvable): boolean {
    return this.bitfield === (this.constructor as unknown as BitFieldStatic).resolve(bit);
  }

  has(bit: BitFieldResolvable, ..._hasParams: unknown[]): boolean {
    const resolved = (this.constructor as unknown as BitFieldStatic).resolve(bit) as number | bigint;
    const lhs = this.bitfield;
    if (typeof lhs === 'bigint' || typeof resolved === 'bigint') {
      return ((lhs as bigint) & (resolved as bigint)) === (resolved as bigint);
    }
    return ((lhs as number) & (resolved as number)) === (resolved as number);
  }

  missing(bits: BitFieldResolvable, ...hasParams: unknown[]): string[] {
    return new (this.constructor as unknown as new (b: BitFieldResolvable) => BitField)(bits)
      .remove(this)
      .toArray(...hasParams);
  }

  freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  add(...bits: BitFieldResolvable[]): this {
    const ctor = this.constructor as unknown as BitFieldStatic;
    let total: number | bigint = ctor.defaultBit;
    for (const bit of bits) {
      const resolved = ctor.resolve(bit);
      total =
        typeof total === 'bigint' ? (total as bigint) | (resolved as bigint) : (total as number) | (resolved as number);
    }
    const next =
      typeof this.bitfield === 'bigint'
        ? (this.bitfield as bigint) | (total as bigint)
        : (this.bitfield as number) | (total as number);
    if (Object.isFrozen(this))
      return new (this.constructor as unknown as new (b: BitFieldResolvable) => BitField)(next) as this;
    this.bitfield = next;
    return this;
  }

  remove(...bits: BitFieldResolvable[]): this {
    const ctor = this.constructor as unknown as BitFieldStatic;
    let total: number | bigint = ctor.defaultBit;
    for (const bit of bits) {
      const resolved = ctor.resolve(bit);
      total =
        typeof total === 'bigint' ? (total as bigint) | (resolved as bigint) : (total as number) | (resolved as number);
    }
    const next =
      typeof this.bitfield === 'bigint'
        ? (this.bitfield as bigint) & ~(total as bigint)
        : (this.bitfield as number) & ~(total as number);
    if (Object.isFrozen(this))
      return new (this.constructor as unknown as new (b: BitFieldResolvable) => BitField)(next) as this;
    this.bitfield = next;
    return this;
  }

  serialize(...hasParams: unknown[]): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    const flags = (this.constructor as unknown as BitFieldStatic).FLAGS;
    for (const [flag, bit] of Object.entries(flags)) {
      serialized[flag] = this.has(bit as BitFieldResolvable, ...(hasParams as unknown[]));
    }
    return serialized;
  }

  toArray(...hasParams: unknown[]): string[] {
    const flags = (this.constructor as unknown as BitFieldStatic).FLAGS;
    return Object.keys(flags).filter(bit => this.has(bit as BitFieldResolvable, ...(hasParams as unknown[])));
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
    const self = this as unknown as BitFieldStatic;
    const { defaultBit } = self;
    if (typeof defaultBit === typeof bit && (bit as number | bigint) >= defaultBit) return bit as number | bigint;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit
        .map((p: BitFieldResolvable) => self.resolve(p))
        .reduce((prev: number | bigint, p: number | bigint) => {
          if (typeof prev === 'bigint' || typeof p === 'bigint') return (prev as bigint) | (p as bigint);
          return (prev as number) | (p as number);
        }, defaultBit);
    if (typeof bit === 'string') {
      if (!isNaN(Number(bit))) return typeof defaultBit === 'bigint' ? BigInt(bit) : Number(bit);
      if (self.FLAGS[bit] !== undefined) return self.FLAGS[bit];
    }
    throw new RangeError('BITFIELD_INVALID', bit);
  }
}

export default BitField;
