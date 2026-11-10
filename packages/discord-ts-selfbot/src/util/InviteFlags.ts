import BitField from "./BitField";

class InviteFlags extends BitField {}

InviteFlags.FLAGS = {
  IS_APPLICATION_BYPASS: 1 << 3,
  IS_ENHANCED: 1 << 2,
  IS_GUEST_INVITE: 1,
  IS_VIEWED: 1 << 1,
};

export default InviteFlags;
export { InviteFlags };
