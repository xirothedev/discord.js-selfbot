import BitField from './BitField';

class Speaking extends BitField {}

Speaking.FLAGS = {
  SPEAKING: 1 << 0,
  SOUNDSHARE: 1 << 1,
  PRIORITY_SPEAKING: 1 << 2,
};

export default Speaking;
export { Speaking };
