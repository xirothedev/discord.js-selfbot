interface UnfurledMediaItemSource {
  url?: string;
  data?: UnfurledMediaItemSource;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is UnfurledMediaItemSource {
  return typeof value === 'object' && value !== null;
}

class UnfurledMediaItem {
  declare url: string | null;
  declare data: UnfurledMediaItemSource;
  /**
   * @property {string} [url] Supports arbitrary urls and `attachment://<filename>` references
   */
  /**
   * @param {UnfurledMediaItem | APIUnfurledMediaItem} [data={}] The data
   */
  constructor(data: unknown = { url: '' }) {
    const source = isRecord(data) ? data : {};
    /**
     * @type {string}
     */
    this.url = typeof source.url === 'string' ? source.url : null;
    /**
     * @type {APIUnfurledMediaItem}
     */
    this.data = isRecord(source.data) ? source.data : source;
  }
  /**
   * Returns the API-compatible JSON for this media item
   * @returns {APIUnfurledMediaItem}
   */
  toJSON() {
    return { url: this.url ?? '', ...this.data };
  }
}

export default UnfurledMediaItem;
export { UnfurledMediaItem };
