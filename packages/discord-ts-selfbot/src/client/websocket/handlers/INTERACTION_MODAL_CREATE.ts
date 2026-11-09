import Modal from '../../../structures/Modal';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, { d: data }: any) => {
  /**
   * Emitted whenever client user receive interaction.showModal()
   * @event Client#interactionModalCreate
   * @param {Modal} modal The modal (extended)
   */
  client.emit(Events.INTERACTION_MODAL_CREATE, new Modal(data, client));
};
