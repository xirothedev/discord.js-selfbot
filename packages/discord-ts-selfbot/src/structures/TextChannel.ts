import BaseGuildTextChannel from "./BaseGuildTextChannel";

class TextChannel extends BaseGuildTextChannel {
  _patch(
    data: Parameters<typeof BaseGuildTextChannel.prototype._patch>[0] & {
      rate_limit_per_user?: number | null;
    }
  ) {
    super._patch(data);

    if ("rate_limit_per_user" in data) {
      this.rateLimitPerUser = data.rate_limit_per_user;
    }
  }

  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }
}

export default TextChannel;
export { TextChannel };
