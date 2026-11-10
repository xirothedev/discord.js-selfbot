import Util from '../util/Util';
import type { RawVoiceRegionData } from '../../typings/rawDataTypes';

class VoiceRegion {
  declare id: string;
  declare name: string;
  declare vip: boolean;
  declare deprecated: boolean;
  declare optimal: boolean;
  declare custom: boolean;

  constructor(data: RawVoiceRegionData) {
    this.id = data.id;

    this.name = data.name;

    /**
     * Whether the region is VIP-only
     * @type {boolean}
     * @deprecated This property is no longer being sent by the API.
     */
    this.vip = 'vip' in data ? Boolean(data.vip) : false;

    this.deprecated = data.deprecated;

    this.optimal = data.optimal;

    this.custom = data.custom;
  }

  toJSON() {
    return Util.flatten(this);
  }
}

export default VoiceRegion;
export { VoiceRegion };
