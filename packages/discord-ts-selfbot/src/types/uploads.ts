/**
 * A pre-signed upload slot returned by the attachments endpoint.
 */
export interface UploadAttachment {
  id: string;
  upload_url: string;
  upload_filename: string;
}
