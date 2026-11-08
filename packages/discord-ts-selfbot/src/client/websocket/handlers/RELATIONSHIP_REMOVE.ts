const { Events } = require('../../../util/Constants');
export = (client: any, { d: data }: any) => {
  client.relationships.cache.delete(data.id);
  client.relationships.friendNicknames.delete(data.id);
  client.relationships.sinceCache.delete(data.id);
  /**
   * Emitted when a relationship is removed, relevant to the current user.
   * @event Client#relationshipRemove
   * @param {Snowflake} user The userID that was updated
   * @param {RelationshipType} type The type of the old relationship
   * @param {string | null} nickname The nickname of the user in this relationship (1-32 characters)
   */
  client.emit(Events.RELATIONSHIP_REMOVE, data.id, data.type, data.nickname);
};
