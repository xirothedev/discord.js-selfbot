import _PresenceModule from './Presence';
const { Presence } = _PresenceModule;
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { ActivityTypes, Opcodes } = _ConstantsModule;
import { ActivityType, type GatewayActivityUpdateData } from 'discord-api-types/v10';
import type { Client } from '../client/Client';
import type { PresenceData, PresenceStatus } from '../../typings';
import type { RawActivityData } from '../../typings/rawDataTypes';

const CustomStatusActivityTypes = [ActivityTypes.CUSTOM, ActivityTypes[ActivityTypes.CUSTOM]];

interface PresenceActivitySource {
  name?: string;
  type?: string | number;
  state?: string | null;
  url?: string | null;
  toJSON?: () => unknown;
}

interface PresenceDataSource extends Omit<PresenceData, 'activities'> {
  since?: number;
  activities?: PresenceActivitySource[];
}

interface ClientPresencePacket {
  activities: GatewayActivityUpdateData[];
  afk: boolean;
  since: number;
  status: PresenceStatus;
}

function isActivityType(value: unknown): value is ActivityType {
  return typeof value === 'number' && value in ActivityType;
}

function toActivityPatch(activity: PresenceActivitySource): Partial<RawActivityData> {
  return {
    name: activity.name,
    type: resolveActivityType(activity.type),
    state: activity.state ?? undefined,
    url: activity.url ?? undefined,
  };
}

function resolveActivityType(type: string | number | undefined): ActivityType {
  if (typeof type === 'number') return isActivityType(type) ? type : ActivityType.Playing;
  if (typeof type === 'string') {
    const resolved = resolveEnumValue(ActivityTypes, type);
    return resolved !== undefined && isActivityType(resolved) ? resolved : ActivityType.Playing;
  }
  return ActivityType.Playing;
}

/**
 * Represents the client's presence.
 * @extends {Presence}
 */
class ClientPresence extends Presence {
  constructor(client: Client, data: PresenceDataSource = {}) {
    const { activities, ...rest } = data;
    super(client, Object.assign(rest, { status: data.status ?? 'online', user: { id: null } }));
    if (activities) this._patch({ activities: activities.map(toActivityPatch) });
  }

  /**
   * Sets the client's presence
   * @param {PresenceData} presence The data to set the presence to
   * @returns {ClientPresence}
   */
  set(presence: PresenceDataSource) {
    const packet = this._parse(presence);
    this._patch(packet);
    packet.activities = this.activities.map(activity => ({
      name: activity.name,
      state: activity.state ?? undefined,
      type: resolveActivityType(activity.type),
      url: activity.url ?? undefined,
    }));
    this.client.ws.broadcast({ op: Opcodes.STATUS_UPDATE, d: packet });
    return this;
  }

  /**
   * Parses presence data into a packet ready to be sent to Discord
   * @param {PresenceData} presence The data to parse
   * @returns {APIPresence}
   * @private
   */
  _parse({ status, since, afk, activities }: PresenceDataSource): ClientPresencePacket {
    const data: ClientPresencePacket = {
      activities: [],
      afk: typeof afk === 'boolean' ? afk : this.afk,
      since: typeof since === 'number' && !Number.isNaN(since) ? this.since : 0,
      status: status ?? this.status,
    };
    if (activities?.length) {
      for (const [i, activity] of activities.entries()) {
        if (typeof activity.name !== 'string') throw new TypeError('INVALID_TYPE', `activities[${i}].name`, 'string');

        const activityType = resolveEnumValue(ActivityTypes, activity.type ?? ActivityTypes.PLAYING);

        if (activityType !== undefined && CustomStatusActivityTypes.includes(activityType) && !activity.state) {
          activity.state = activity.name;
          activity.name = 'Custom Status';
        }

        data.activities.push({
          name: activity.name,
          state: activity.state ?? undefined,
          type: resolveActivityType(activityType),
          url: activity.url ?? undefined,
        });
      }
    } else if (!activities && (status || afk || since) && this.activities.length) {
      data.activities.push(
        ...this.activities.map(activity => ({
          name: activity.name,
          state: activity.state ?? undefined,
          type: resolveActivityType(activity.type),
          url: activity.url ?? undefined,
        })),
      );
    }

    return data;
  }
}

export default ClientPresence;
export { ClientPresence };

/* eslint-disable max-len */
/**
 * @external APIPresence
 * @see {@link https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields}
 */
