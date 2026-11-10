import BitField from "./BitField";

class ActivityFlags extends BitField {}

ActivityFlags.FLAGS = {
  EMBEDDED: 1 << 8,
  INSTANCE: 1 << 0,
  JOIN: 1 << 1,
  JOIN_REQUEST: 1 << 3,
  PARTY_PRIVACY_FRIENDS: 1 << 6,
  PARTY_PRIVACY_VOICE_CHANNEL: 1 << 7,
  PLAY: 1 << 5,
  SPECTATE: 1 << 2,
  SYNC: 1 << 4,
};

export default ActivityFlags;
export { ActivityFlags };
