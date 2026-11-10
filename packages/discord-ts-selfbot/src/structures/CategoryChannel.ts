import GuildChannel from './GuildChannel';
import type { CategoryCreateChannelOptions } from '../../typings';

class CategoryChannel extends GuildChannel {
  get children() {
    return this.guild.channels.cache.filter(channel => channel.parentId === this.id);
  }

  createChannel(name: string, options: CategoryCreateChannelOptions) {
    return this.guild.channels.create(name, {
      ...options,
      parent: this.id,
    });
  }
}

export default CategoryChannel;
export { CategoryChannel };
