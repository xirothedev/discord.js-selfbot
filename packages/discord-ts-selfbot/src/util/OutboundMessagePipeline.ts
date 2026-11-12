import Util from './Util';
import type { Client } from '../client/Client';
import type { HTTPAttachmentData } from '../../typings';
import type { UploadAttachment } from '../types/uploads';

export interface UploadedMessageAttachment {
  description?: string;
  duration_secs?: number;
  filename: string;
  id: string;
  uploaded_filename: string;
  waveform?: string;
}

export async function uploadMessageAttachments(
  client: Client,
  channelId: string,
  files: HTTPAttachmentData[]
): Promise<UploadedMessageAttachment[]> {
  if (!files.length) {
    return [];
  }

  const uploads = (await Util.getUploadURL(
    client,
    channelId,
    files
  )) as UploadAttachment[];

  const attachments = await Promise.all(
    uploads.map(async (upload: UploadAttachment) => {
      const file = files[Number(upload.id)];
      if (!file) {
        throw new TypeError('Invalid upload attachment index');
      }
      await Util.uploadFile(file.file, upload.upload_url);
      return {
        description: file.description,
        duration_secs: file.duration_secs,
        filename: file.name,
        id: upload.id,
        uploaded_filename: upload.upload_filename,
        waveform: file.waveform,
      } satisfies UploadedMessageAttachment;
    })
  );

  attachments.sort(
    (left, right) => Math.trunc(Number(left.id)) - Math.trunc(Number(right.id))
  );
  return attachments;
}

export default { uploadMessageAttachments };
