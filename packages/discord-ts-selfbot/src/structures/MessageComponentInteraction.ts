import Interaction from "./Interaction";
import InteractionWebhook from "./InteractionWebhook";
import InteractionResponses from "./interfaces/InteractionResponses";
import _ConstantsModule from "../util/Constants";
import type { APIMessage, Snowflake } from "discord-api-types/v10";
import type { CacheType, MessageComponentType } from "../../typings";
import type { RawMessageComponentInteractionData } from "../../typings/rawDataTypes";
import type { Message } from "./Message";
import type Client from "../client/Client";

const { MessageComponentTypes } = _ConstantsModule;

function isComponentType(
  value: unknown
): value is Exclude<MessageComponentType, "ACTION_ROW"> {
  return (
    typeof value === "string" &&
    value in MessageComponentTypes &&
    value !== "ACTION_ROW"
  );
}

class MessageComponentInteraction<
  Cached extends CacheType = CacheType,
> extends Interaction<Cached> {
  declare componentType: Exclude<MessageComponentType, "ACTION_ROW">;
  declare customId: string;
  declare channelId: Snowflake;
  declare deferred: boolean;
  declare ephemeral: boolean | null;
  declare message: Message | APIMessage;
  declare replied: boolean;
  declare webhook: InteractionWebhook;

  constructor(client: Client, data: RawMessageComponentInteractionData) {
    super(client, data);

    this.message = this.channel?.messages._add(data.message) ?? data.message;

    this.customId = data.data.custom_id;

    const componentType = MessageComponentInteraction.resolveType(
      data.data.component_type
    );
    if (!componentType) {
      throw new Error("INVALID_COMPONENT_TYPE");
    }
    this.componentType = componentType;

    this.deferred = false;

    this.ephemeral = null;

    this.replied = false;

    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );
  }

  get component() {
    const rows =
      "components" in this.message && this.message.components
        ? this.message.components
        : [];
    const components: unknown[] = [];
    for (const row of rows) {
      if ("components" in row && Array.isArray(row.components)) {
        components.push(...row.components);
      }
    }
    return components.find((component) => {
      if (typeof component !== "object" || component === null) {
        return false;
      }
      if ("customId" in component && component.customId === this.customId) {
        return true;
      }
      return "custom_id" in component && component.custom_id === this.customId;
    });
  }

  static resolveType(
    type: string | number | undefined
  ): Exclude<MessageComponentType, "ACTION_ROW"> | undefined {
    if (typeof type === "number") {
      const name = MessageComponentTypes[type];
      return isComponentType(name) ? name : undefined;
    }
    return isComponentType(type) ? type : undefined;
  }

  // These are here only for documentation purposes - they are implemented by InteractionResponses
  /* eslint-disable no-empty-function */
  deferReply() {}
  reply() {}
  fetchReply() {}
  editReply() {}
  deleteReply() {}
  followUp() {}
  deferUpdate() {}
  update() {}
  showModal() {}
  awaitModalSubmit() {}
}

InteractionResponses.applyToClass(MessageComponentInteraction);

export default MessageComponentInteraction;
export { MessageComponentInteraction };
