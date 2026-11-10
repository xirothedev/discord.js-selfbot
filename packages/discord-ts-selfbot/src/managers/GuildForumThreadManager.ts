import ThreadManager from './ThreadManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import MessagePayload from '../structures/MessagePayload';
import _UtilModule from '../util/Util';

const { resolveAutoArchiveMaxLimit, getUploadURL, uploadFile } = _UtilModule;
import type { RESTPostAPIChannelThreadsResult } from 'discord-api-types/v10';
import type { GuildForumThreadCreateOptions } from '../../typings';
import type { MessagePayloadOptions } from '../structures/MessagePayload';

type GuildForumThreadCreateOptionsSource = Omit<
  GuildForumThreadCreateOptions,
  'message'
> & {
  message: MessagePayload | MessagePayloadOptions;
};

class GuildForumThreadManager extends ThreadManager {
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

    const messagePayload =
      message instanceof MessagePayload
        ? message.resolveData()
        : MessagePayload.create(this, message).resolveData();

    const { data: body, files } = await messagePayload.resolveFiles();
    const fileList = files ?? [];

    // New API
    const attachments = await getUploadURL(
      this.client,
      this.channel.id,
      fileList
    );
    const requestPromises = attachments.map(async (attachment) => {
      const index = Number(attachment.id);
      const file = fileList[index];
      if (!file) {
        throw new TypeError('GUILD_FORUM_ATTACHMENT_MISSING');
      }
      await uploadFile(file.file, attachment.upload_url);
      return {
        description: file.description,
        duration_secs: file.duration_secs,
        filename: file.name,
        id: attachment.id,
        uploaded_filename: attachment.upload_filename,
        waveform: file.waveform,
      };
    });
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort(
      (left, right) =>
        Math.trunc(Number(left.id)) - Math.trunc(Number(right.id))
    );

    let archiveDuration = autoArchiveDuration;
    if (autoArchiveDuration === 'MAX') {
      resolveAutoArchiveMaxLimit(this.channel.guild);
      archiveDuration = 10_080;
    }

    const post_data = await this.client.api
      .channels(this.channel.id)
      .threads.post<RESTPostAPIChannelThreadsResult>({
        data: {
          applied_tags: appliedTags,
          attachments: attachmentsData,
          auto_archive_duration: archiveDuration,
          message: body,
          name,
          rate_limit_per_user: rateLimitPerUser,
        },
        files: [],
        reason,
      });

    return this.client.actions.ThreadCreate.handle(post_data).thread;
  }
}

export default GuildForumThreadManager;
export { GuildForumThreadManager };
