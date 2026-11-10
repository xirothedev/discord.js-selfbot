// Discord epoch (2015-01-01T00:00:00.000Z)
const EPOCH = 1_420_070_400_000;
let INCREMENT = 0n;

class SnowflakeUtil extends null {
  static generate(timestamp: number | Date = Date.now()) {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    if (typeof time !== 'number' || Number.isNaN(time)) {
      throw new TypeError(
        `"timestamp" argument must be a number (received ${Number.isNaN(time) ? 'NaN' : typeof time})`
      );
    }
    if (INCREMENT >= 4095n) {
      INCREMENT = 0n;
    }

    // Assign WorkerId as 1 and ProcessId as 0:
    return (
      (BigInt(time - EPOCH) << 22n) |
      (1n << 17n) |
      INCREMENT++
    ).toString();
  }

  static deconstruct(snowflake: string | number | bigint) {
    const bigIntSnowflake = BigInt(snowflake);
    return {
      binary: bigIntSnowflake.toString(2).padStart(64, '0'),
      get date() {
        return new Date(this.timestamp);
      },
      increment: Number(bigIntSnowflake & 0b1111_1111_1111n),
      processId: Number((bigIntSnowflake >> 12n) & 0b1_1111n),
      timestamp: Number(bigIntSnowflake >> 22n) + EPOCH,
      workerId: Number((bigIntSnowflake >> 17n) & 0b1_1111n),
    };
  }

  static timestampFrom(snowflake: string | number | bigint) {
    return Number(BigInt(snowflake) >> 22n) + EPOCH;
  }

  static get EPOCH() {
    return EPOCH;
  }
}

export default SnowflakeUtil;
export { SnowflakeUtil };
