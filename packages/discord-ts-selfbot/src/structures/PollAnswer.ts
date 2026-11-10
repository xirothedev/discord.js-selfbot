import Base from "./Base";
import _EmojiModule from "./Emoji";

const { Emoji } = _EmojiModule;
import type { APIPartialEmoji, APIPollAnswer } from "discord-api-types/v10";
import type { BaseFetchPollAnswerVotersOptions } from "../../typings";
import type { Poll } from "./Poll";
import _errorsModule from "../errors";
import type Client from "../client/Client";

const { Error } = _errorsModule;

class PollAnswer extends Base {
  declare poll: Poll;
  declare id: number;
  declare text: string | null;
  declare _emoji: APIPartialEmoji | null;
  declare voteCount: number;

  constructor(
    client: Client,
    data: Partial<APIPollAnswer> & { count?: number; answer_id?: number },
    poll: Poll
  ) {
    super(client);

    Object.defineProperty(this, "poll", { value: poll });

    this.id = data.answer_id ?? 0;

    this.text = data.poll_media?.text ?? null;

    Object.defineProperty(this, "_emoji", {
      value: data.poll_media?.emoji ?? null,
    });

    this._patch(data);
  }

  _patch(data: Partial<APIPollAnswer> & { count?: number }) {
    // This `count` field comes from `poll.results.answer_counts`
    if ("count" in data) {
      this.voteCount = data.count ?? 0;
    } else {
      this.voteCount ??= 0;
    }
  }

  get emoji() {
    if (!this._emoji || (!this._emoji.id && !this._emoji.name)) {
      return null;
    }
    return (
      (this._emoji.id ? this.client.emojis.cache.get(this._emoji.id) : null) ??
      new Emoji(this.client, this._emoji)
    );
  }

  fetchVoters({ after, limit }: BaseFetchPollAnswerVotersOptions = {}) {
    const { channel } = this.poll.message;
    if (!channel) {
      throw new Error("CHANNEL_NOT_CACHED");
    }
    return channel.messages.fetchPollAnswerVoters({
      after,
      answerId: this.id,
      limit,
      messageId: this.poll.message.id,
    });
  }
}

export { PollAnswer };
export default { PollAnswer };
