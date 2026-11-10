import Base from './Base';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawBaseGuildData } from '../../typings/rawDataTypes';
import type { BaseGuildEntity } from '../types/entities/base-guild';
import type { ImageURLOptions } from '../../typings';
import { GuildFeature } from 'discord-api-types/v10';

class BaseGuild extends Base implements BaseGuildEntity {
  declare id: BaseGuildEntity['id'];
  declare name: BaseGuildEntity['name'];
  declare icon: BaseGuildEntity['icon'];
  declare features: BaseGuildEntity['features'];

  constructor(client: import('../client/Client').default, data: RawBaseGuildData) {
    super(client);

    this.id = data.id;

    this.name = 'name' in data ? data.name : '';

    this.icon = 'icon' in data ? (data.icon ?? null) : null;

    this.features = 'features' in data ? (data.features ?? []) : [];
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get nameAcronym() {
    return this.name
      .replace(/'s /g, ' ')
      .replace(/\w+/g, e => e[0])
      .replace(/\s/g, '');
  }

  get partnered() {
    return this.features.includes(GuildFeature.Partnered);
  }

  get verified() {
    return this.features.includes(GuildFeature.Verified);
  }

  iconURL({ format = 'webp', size, dynamic }: ImageURLOptions = {}) {
    if (!this.icon) return null;
    return this.client.rest.cdn.Icon(this.id, this.icon, format, size, dynamic);
  }

  async fetch() {
    const data = await this.client.api.guilds(this.id).get({ query: { with_counts: true } });
    return this.client.guilds._add(data);
  }

  toString() {
    return this.name;
  }
}

export default BaseGuild;
export { BaseGuild };
