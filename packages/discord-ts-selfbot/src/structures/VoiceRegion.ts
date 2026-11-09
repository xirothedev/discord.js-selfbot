import Util from '../util/Util';
import type { RawVoiceRegionData } from '../../typings/rawDataTypes';

/**
 * Represents a Discord voice region for guilds.
 */
class VoiceRegion {
  declare id: string;
  declare name: string;
  declare vip: boolean;
  declare deprecated: boolean;
  declare optimal: boolean;
  declare custom: boolean;

  constructor(data: RawVoiceRegionData) {
    /**
     * The region's id
     * @type {string}
     */
    this.id = data.id;

    /**
     * Name of the region
     * @type {string}
     */
    this.name = data.name;

    /**
     * Whether the region is VIP-only
     * @type {boolean}
     * @deprecated This property is no longer being sent by the API.
     */
    this.vip = 'vip' in data ? Boolean(data.vip) : false;

    /**
     * Whether the region is deprecated
     * @type {boolean}
     */
    this.deprecated = data.deprecated;

    /**
     * Whether the region is optimal
     * @type {boolean}
     */
    this.optimal = data.optimal;

    /**
     * Whether the region is custom
     * @type {boolean}
     */
    this.custom = data.custom;
  }

  toJSON() {
    return Util.flatten(this);
  }
}

export default VoiceRegion;
export { VoiceRegion };
