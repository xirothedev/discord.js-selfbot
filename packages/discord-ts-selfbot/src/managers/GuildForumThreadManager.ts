import ThreadManager from './ThreadManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import MessagePayload from '../structures/MessagePayload';
import _UtilModule from '../util/Util';
const { resolveAutoArchiveMaxLimit, getUploadURL, uploadFile } = _UtilModule;
import type { RESTPostAPIChannelThreadsResult } from 'discord-api-types/v10';
import type { GuildForumThreadCreateOptions } from '../../typings';
import type { MessagePayloadOptions } from '../structures/MessagePayload';

type GuildForumThreadCreateOptionsSource = Omit<GuildForumThreadCreateOptions, 'message'> & {
  message: MessagePayload | MessagePayloadOptions;
};

/**
 * Manages API methods for threads in forum channels and stores their cache.
 * @extends {ThreadManager}
 */
class GuildForumThreadManager extends ThreadManager {
  /**
   * The channel this Manager belongs to
   * @name GuildForumThreadManager#channel
   * @type {ForumChannel|MediaChannel}
   */

  /**
   * @typedef {BaseMessageOptions} GuildForumThreadMessageCreateOptions
   * @property {StickerResolvable} [stickers] The stickers to send with the message
   * @property {BitFieldResolvable} [flags] The flags to send with the message.
   * Only `SUPPRESS_EMBEDS` and `SUPPRESS_NOTIFICATIONS` can be set.
   */

  /**
   * Options for creating a thread.
   * @typedef {StartThreadOptions} GuildForumThreadCreateOptions
   * @property {GuildForumThreadMessageCreateOptions|MessagePayload} message The message associated with the thread post
   * @property {Snowflake[]} [appliedTags] The tags to apply to the thread
   */

  /**
   * Creates a new thread in the channel.
   * @param {GuildForumThreadCreateOptions} [options] Options to create a new thread
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Create a new forum post
   * forum.threads
   *   .create({
   *     name: 'Food Talk',
   *     autoArchiveDuration: 60,
   *     message: {
   *      content: 'Discuss your favorite food!',
   *     },
   *     reason: 'Needed a separate thread for food',
   *   })
   *   .then(threadChannel => console.log(threadChannel))
   *   .catch(console.error);
   */
  async create({
    name,
    autoArchiveDuration = this.channel.defaultAutoArchiveDuration ?? undefined,
    message,
    reason,
    rateLimitPerUser,
    appliedTags,
  }: GuildForumThreadCreateOptionsSource) {
    if (!message) {
      throw new TypeError('GUILD_FORUM_MESSAGE_REQUIRED');
    }

    let messagePayload;

    if (message instanceof MessagePayload) {
      messagePayload = message.resolveData();
    } else {
      messagePayload = MessagePayload.create(this, message).resolveData();
    }

    const { data: body, files } = await messagePayload.resolveFiles();
    const fileList = files ?? [];

    // New API
    const attachments = await getUploadURL(this.client, this.channel.id, fileList);
    const requestPromises = attachments.map(async attachment => {
      const index = Number(attachment.id);
      const file = fileList[index];
      if (!file) throw new TypeError('GUILD_FORUM_ATTACHMENT_MISSING');
      await uploadFile(file.file, attachment.upload_url);
      return {
        id: attachment.id,
        filename: file.name,
        uploaded_filename: attachment.upload_filename,
        description: file.description,
        duration_secs: file.duration_secs,
        waveform: file.waveform,
      };
    });
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    if (autoArchiveDuration === 'MAX') {
      resolveAutoArchiveMaxLimit(this.channel.guild);
      autoArchiveDuration = 10080;
    }

    const post_data = await this.client.api.channels(this.channel.id).threads.post<RESTPostAPIChannelThreadsResult>({
      data: {
        name,
        auto_archive_duration: autoArchiveDuration,
        rate_limit_per_user: rateLimitPerUser,
        applied_tags: appliedTags,
        message: body,
        attachments: attachmentsData,
      },
      files: [],
      reason,
    });

    return this.client.actions.ThreadCreate.handle(post_data).thread;
  }
}

export default GuildForumThreadManager;
export { GuildForumThreadManager };
