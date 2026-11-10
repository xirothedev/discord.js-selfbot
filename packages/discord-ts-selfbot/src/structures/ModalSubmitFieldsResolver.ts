import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;
import type { PartialModalActionRow, PartialTextInputData } from '../../typings';

class ModalSubmitFieldsResolver {
  declare components: PartialModalActionRow[];

  constructor(components: PartialModalActionRow[]) {
    this.components = components;
  }

  get _fields(): PartialTextInputData[] {
    return this.components.reduce<PartialTextInputData[]>((previous, next) => previous.concat(next.components), []);
  }

  getField(customId: string): PartialTextInputData {
    const field = this._fields.find(f => f.customId === customId);
    if (!field) throw new TypeError('MODAL_SUBMIT_INTERACTION_FIELD_NOT_FOUND', customId);
    return field;
  }

  getTextInputValue(customId: string): string {
    const field = this.getField(customId);
    const expectedType = MessageComponentTypes[MessageComponentTypes.TEXT_INPUT];
    if (field.type !== expectedType) {
      throw new TypeError('MODAL_SUBMIT_INTERACTION_FIELD_TYPE', customId, field.type, expectedType);
    }
    return field.value;
  }
}

export default ModalSubmitFieldsResolver;
export { ModalSubmitFieldsResolver };
