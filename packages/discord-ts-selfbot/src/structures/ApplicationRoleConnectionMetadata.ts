import _ConstantsModule from '../util/Constants';
const { ApplicationRoleConnectionMetadataTypes } = _ConstantsModule;
import type { APIApplicationRoleConnectionMetadata, LocalizationMap } from 'discord-api-types/v10';

/**
 * Role connection metadata object for an application.
 */
class ApplicationRoleConnectionMetadata {
  declare name: string;
  declare nameLocalizations: LocalizationMap | null;
  declare description: string;
  declare descriptionLocalizations: LocalizationMap | null;
  declare key: string;
  declare type: import('../../typings/enums').ApplicationRoleConnectionMetadataTypes;

  constructor(data: APIApplicationRoleConnectionMetadata) {
    /**
     * The name of this metadata field
     * @type {string}
     */
    this.name = data.name;

    /**
     * The name localizations for this metadata field
     * @type {?Object<Locale, string>}
     */
    this.nameLocalizations = data.name_localizations ?? null;

    /**
     * The description of this metadata field
     * @type {string}
     */
    this.description = data.description;

    /**
     * The description localizations for this metadata field
     * @type {?Object<Locale, string>}
     */
    this.descriptionLocalizations = data.description_localizations ?? null;

    /**
     * The dictionary key for this metadata field
     * @type {string}
     */
    this.key = data.key;

    /**
     * The type of this metadata field
     * @type {ApplicationRoleConnectionMetadataType}
     */
    this.type = typeof data.type === 'number' ? ApplicationRoleConnectionMetadataTypes[data.type] : data.type;
  }
}

export { ApplicationRoleConnectionMetadata };
export default { ApplicationRoleConnectionMetadata };
