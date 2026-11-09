class UnfurledMediaItem {
  declare url: string | null;
  declare data: import('discord-api-types/v10').APIUnfurledMediaItem;
  /**
   * @property {string} [url] Supports arbitrary urls and `attachment://<filename>` references
   */
  /**
   * @param {UnfurledMediaItem | APIUnfurledMediaItem} [data={}] The data
   */
  constructor(data: UnfurledMediaItem | import('discord-api-types/v10').APIUnfurledMediaItem = { url: '' }) {
    /**
     * @type {string}
     */
    this.url = data.url ?? null;
    /**
     * @type {APIUnfurledMediaItem}
     */
    this.data = 'data' in data ? data.data : data;
  }
  /**
   * Returns the API-compatible JSON for this media item
   * @returns {APIUnfurledMediaItem}
   */
  toJSON(): import('discord-api-types/v10').APIUnfurledMediaItem {
    return { ...this.data };
  }
}

export default UnfurledMediaItem;
export { UnfurledMediaItem };
