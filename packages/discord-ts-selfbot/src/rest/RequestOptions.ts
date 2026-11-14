interface RequestOptions {
  route?: string;
  version?: number;
  versioned?: boolean;
  auth?: boolean;
  query?: Record<string, unknown>;
  data?: unknown;
  files?: unknown[];
  headers?: Record<string, string>;
  reason?: string;
  webhook?: boolean;
  usePayloadJSON?: boolean;
  dontUsePayloadJSON?: boolean;
  DiscordContext?: unknown;
  mfaToken?: string;
}

function deriveRoute(path: string): string {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  const bucket: string[] = [''];
  for (const [index, part] of parts.entries()) {
    if (parts[index - 1] === 'reactions') {
      break;
    }
    if (
      /\d{16,19}/u.test(part) &&
      !/channels|guilds/u.test(parts[index - 1] ?? '')
    ) {
      bucket.push(':id');
    } else {
      bucket.push(part);
    }
  }
  return bucket.join('/') || '/';
}

export default RequestOptions;
export type { RequestOptions };
export { deriveRoute };
