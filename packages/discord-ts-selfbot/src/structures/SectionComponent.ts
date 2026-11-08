const BaseMessageComponent = require('./BaseMessageComponent');
const { MessageComponentTypes } = require('../util/Constants');

class SectionComponent extends BaseMessageComponent {
  [key: string]: any;
  /**
   * @property {TextDisplayComponent[]} [components] One to three text components
   * @property {ThumbnailComponent|MessageButton} [accessory] A thumbnail or a button component, with a future possibility of adding more compatible components
   */

  /**
   * @param {SectionComponent | APISectionComponent} [data={}] The data
   */
  constructor(data: any = {}) {
    super({ type: 'SECTION' });

    this.setup(data);
  }

  setup(data: any) {
    super.setup(data);
    /**
     * One to three text components
     * @type {TextDisplayComponent[]}
     */
    this.components = data.components?.map((c: any) => BaseMessageComponent.create(c)) ?? [];

    /**
     * A thumbnail or a button component, with a future possibility of adding more compatible components
     * @type {ThumbnailComponent|MessageButton}
     */
    this.accessory = BaseMessageComponent.create(data.accessory) ?? null;
  }

  /**
   * @returns {APISectionComponent}
   */
  toJSON() {
    return {
      type: MessageComponentTypes[this.type],
      components: this.components.map((c: any) => c.toJSON()),
      accessory: this.accessory.toJSON(),
    };
  }
}

export = SectionComponent;
