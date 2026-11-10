import BitField from "./BitField";

class PurchasedFlags extends BitField {}

PurchasedFlags.FLAGS = {
  GUILD_BOOST: 1 << 2,
  NITRO: 1 << 1,
  NITRO_BASIC: 1 << 3,
  NITRO_CLASSIC: 1,
};

export default PurchasedFlags;
export { PurchasedFlags };
