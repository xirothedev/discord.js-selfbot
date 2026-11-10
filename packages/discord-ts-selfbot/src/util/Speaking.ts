import BitField from './BitField';

class Speaking extends BitField {}

Speaking.FLAGS = {
  PRIORITY_SPEAKING: 1 << 2,
  SOUNDSHARE: 1 << 1,
  SPEAKING: 1,
};

export default Speaking;
export { Speaking };
