import BitField from "./BitField";

class AttachmentFlags extends BitField {}

AttachmentFlags.FLAGS = {
  IS_REMIX: 1 << 2,
};

export default AttachmentFlags;
export { AttachmentFlags };
