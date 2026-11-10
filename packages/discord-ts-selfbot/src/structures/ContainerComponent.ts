import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  readComponentBoolean,
  readComponentNumber,
} from "./BaseMessageComponent";
import type {
  ContainerComponentSource,
  MessageComponentInstance,
} from "./BaseMessageComponent";
import { ComponentType } from "discord-api-types/v10";
import type { APIContainerComponent } from "discord-api-types/v10";

function isContainerChild(
  component: MessageComponentInstance | null
): component is ContainerComponentSource {
  return (
    component !== null && BaseMessageComponent.isContainerComponent(component)
  );
}

class ContainerComponent extends BaseMessageComponent {
  declare components: ContainerComponentSource[];
  declare accentColor: number | null;
  declare spoiler: boolean;

  constructor(data: unknown = {}) {
    super({ type: "CONTAINER" });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.components = readComponentArray(source, "components")
      .map((component) => BaseMessageComponent.create(component))
      .filter(isContainerChild);

    this.accentColor =
      readComponentNumber(source, "accent_color", "accentColor") ?? null;

    this.spoiler = readComponentBoolean(source, "spoiler") ?? false;
  }

  get hexAccentColor() {
    return typeof this.accentColor === "number"
      ? `#${this.accentColor.toString(16).padStart(6, "0")}`
      : (this.accentColor ?? null);
  }

  toJSON(): APIContainerComponent {
    return {
      accent_color: this.accentColor,
      components: this.components.map((component) =>
        BaseMessageComponent.serializeContainerComponent(component)
      ),
      spoiler: this.spoiler,
      type: ComponentType.Container,
    };
  }
}

export default ContainerComponent;
export { ContainerComponent };
