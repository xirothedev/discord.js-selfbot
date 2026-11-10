import BitField from './BitField';

class RoleFlags extends BitField {}

RoleFlags.FLAGS = {
  IN_PROMPT: 1 << 0,
};

export default RoleFlags;
export { RoleFlags };
