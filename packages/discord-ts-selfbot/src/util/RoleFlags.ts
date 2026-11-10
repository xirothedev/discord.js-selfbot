import BitField from "./BitField";

class RoleFlags extends BitField {}

RoleFlags.FLAGS = {
  IN_PROMPT: Math.trunc(1),
};

export default RoleFlags;
export { RoleFlags };
