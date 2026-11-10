import BitField from './BitField';

class GuildMemberFlags extends BitField {}

GuildMemberFlags.FLAGS = {
  DID_REJOIN: 1 << 0,
  COMPLETED_ONBOARDING: 1 << 1,
  BYPASSES_VERIFICATION: 1 << 2,
  STARTED_ONBOARDING: 1 << 3,
};

export default GuildMemberFlags;
export { GuildMemberFlags };
