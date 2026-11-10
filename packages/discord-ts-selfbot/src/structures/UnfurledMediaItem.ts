interface UnfurledMediaItemSource {
  url?: string;
  data?: UnfurledMediaItemSource;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is UnfurledMediaItemSource {
  return typeof value === "object" && value !== null;
}

class UnfurledMediaItem {
  declare url: string | null;
  declare data: UnfurledMediaItemSource;
  constructor(data: unknown = { url: "" }) {
    const source = isRecord(data) ? data : {};
    this.url = typeof source.url === "string" ? source.url : null;
    this.data = isRecord(source.data) ? source.data : source;
  }
  toJSON() {
    return { url: this.url ?? "", ...this.data };
  }
}

export default UnfurledMediaItem;
export { UnfurledMediaItem };
