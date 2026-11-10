import BitField from "./BitField";

class PremiumUsageFlags extends BitField {}

PremiumUsageFlags.FLAGS = {
  ANIMATED_AVATAR: 1 << 1,
  PREMIUM_DISCRIMINATOR: 1 << 0,
  PROFILE_BANNER: 1 << 2,
};

export default PremiumUsageFlags;
export { PremiumUsageFlags };
