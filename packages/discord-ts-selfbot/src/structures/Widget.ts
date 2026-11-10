import { Collection } from "@discordjs/collection";
import Base from "./Base";
import WidgetMember from "./WidgetMember";
import type { RawWidgetData } from "../../typings/rawDataTypes";
import type { WidgetChannel } from "../../typings";
import type { WidgetEntity } from "../types/entities/widget";
import type { PatchOf } from "../types/schema";
import type Client from "../client/Client";

class Widget extends Base implements WidgetEntity {
  declare id: WidgetEntity["id"];
  declare name: WidgetEntity["name"];
  declare instantInvite: WidgetEntity["instantInvite"];
  declare channels: WidgetEntity["channels"];
  declare members: WidgetEntity["members"];
  declare presenceCount: WidgetEntity["presenceCount"];

  constructor(client: Client, data: RawWidgetData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<"Widget">) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.instant_invite !== undefined) {
      this.instantInvite = data.instant_invite ?? undefined;
    }

    this.channels = new Collection<string, WidgetChannel>();
    for (const channel of data.channels ?? []) {
      this.channels.set(channel.id, channel);
    }

    this.members = new Collection<string, WidgetMember>();
    for (const member of data.members ?? []) {
      this.members.set(member.id, new WidgetMember(this.client, member));
    }

    if (data.presence_count !== undefined) {
      this.presenceCount = data.presence_count;
    }
  }

  async fetch() {
    const data = await this.client.api
      .guilds(this.id, "widget.json")
      .get<RawWidgetData>();
    this._patch(data);
    return this;
  }
}

export default Widget;
export { Widget };
