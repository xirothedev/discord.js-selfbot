import _ConstantsModule, { resolveEnumMember } from '../util/Constants';
const { ApplicationRoleConnectionMetadataTypes } = _ConstantsModule;
import type { APIApplicationRoleConnectionMetadata, LocalizationMap } from 'discord-api-types/v10';

class ApplicationRoleConnectionMetadata {
  declare name: string;
  declare nameLocalizations: LocalizationMap | null;
  declare description: string;
  declare descriptionLocalizations: LocalizationMap | null;
  declare key: string;
  declare type: import('../../typings/enums').ApplicationRoleConnectionMetadataTypes;

  constructor(data: APIApplicationRoleConnectionMetadata) {
    this.name = data.name;

    this.nameLocalizations = data.name_localizations ?? null;

    this.description = data.description;

    this.descriptionLocalizations = data.description_localizations ?? null;

    this.key = data.key;

    this.type =
      resolveEnumMember(ApplicationRoleConnectionMetadataTypes, data.type) ??
      ApplicationRoleConnectionMetadataTypes.INTEGER_LESS_THAN_OR_EQUAL;
  }
}

export { ApplicationRoleConnectionMetadata };
export default { ApplicationRoleConnectionMetadata };
