import BitField from "./BitField";

class GuildMemberFlags extends BitField {}

GuildMemberFlags.FLAGS = {
  BYPASSES_VERIFICATION: 1 << 2,
  COMPLETED_ONBOARDING: 1 << 1,
  DID_REJOIN: 1,
  STARTED_ONBOARDING: 1 << 3,
};

export default GuildMemberFlags;
export { GuildMemberFlags };
