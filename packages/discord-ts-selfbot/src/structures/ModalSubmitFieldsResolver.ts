import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const { MessageComponentTypes } = _ConstantsModule;
import type {
  PartialModalActionRow,
  PartialTextInputData,
} from '../../typings';

class ModalSubmitFieldsResolver {
  declare components: PartialModalActionRow[];

  constructor(components: PartialModalActionRow[]) {
    this.components = components;
  }

  get _fields(): PartialTextInputData[] {
    const fields: PartialTextInputData[] = [];
    for (const component of this.components) {
      fields.push(...component.components);
    }
    return fields;
  }

  getField(customId: string): PartialTextInputData {
    const field = this._fields.find((entry) => entry.customId === customId);
    if (!field) {
      throw new TypeError('MODAL_SUBMIT_INTERACTION_FIELD_NOT_FOUND', customId);
    }
    return field;
  }

  getTextInputValue(customId: string): string {
    const field = this.getField(customId);
    const expectedType =
      MessageComponentTypes[MessageComponentTypes.TEXT_INPUT];
    if (field.type !== expectedType) {
      throw new TypeError(
        'MODAL_SUBMIT_INTERACTION_FIELD_TYPE',
        customId,
        field.type,
        expectedType
      );
    }
    return field.value;
  }
}

export default ModalSubmitFieldsResolver;
export { ModalSubmitFieldsResolver };
