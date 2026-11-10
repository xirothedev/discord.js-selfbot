import { Collection } from "@discordjs/collection";
import Base from "./Base";
import GuildPreviewEmoji from "./GuildPreviewEmoji";
import _StickerModule from "./Sticker";

const { Sticker } = _StickerModule;
import SnowflakeUtil from "../util/SnowflakeUtil";
import type { RawGuildPreviewData } from "../../typings/rawDataTypes";
import type { ImageURLOptions, StaticImageURLOptions } from "../../typings";
import type { GuildPreviewEntity } from "../types/entities/guild-preview";
import type { PatchOf } from "../types/schema";
import type Client from "../client/Client";

class GuildPreview extends Base implements GuildPreviewEntity {
  declare approximateMemberCount: GuildPreviewEntity["approximateMemberCount"];
  declare approximatePresenceCount: GuildPreviewEntity["approximatePresenceCount"];
  declare description: GuildPreviewEntity["description"];
  declare discoverySplash: GuildPreviewEntity["discoverySplash"];
  declare emojis: GuildPreviewEntity["emojis"];
  declare stickers: GuildPreviewEntity["stickers"];
  declare features: GuildPreviewEntity["features"];
  declare icon: GuildPreviewEntity["icon"];
  declare id: GuildPreviewEntity["id"];
  declare name: GuildPreviewEntity["name"];
  declare splash: GuildPreviewEntity["splash"];

  constructor(client: Client, data: RawGuildPreviewData) {
    super(client);

    if (!data) {
      return;
    }

    this._patch(data);
  }

  _patch(data: PatchOf<"GuildPreview">) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.icon !== undefined) {
      this.icon = data.icon;
    }

    if (data.splash !== undefined) {
      this.splash = data.splash;
    }

    if (data.discovery_splash !== undefined) {
      this.discoverySplash = data.discovery_splash;
    }

    if (data.features !== undefined) {
      this.features = data.features;
    }

    if (data.approximate_member_count !== undefined) {
      this.approximateMemberCount = data.approximate_member_count;
    }

    if (data.approximate_presence_count !== undefined) {
      this.approximatePresenceCount = data.approximate_presence_count;
    }

    if (data.description === undefined) {
      this.description ??= null;
    } else {
      this.description = data.description;
    }

    if (this.emojis) {
      this.emojis.clear();
    } else {
      this.emojis = new Collection<string, GuildPreviewEmoji>();
    }
    for (const emoji of data.emojis ?? []) {
      if (!emoji.id) {
        continue;
      }
      this.emojis.set(
        emoji.id,
        new GuildPreviewEmoji(this.client, emoji, this)
      );
    }

    this.stickers = (data.stickers ?? []).reduce(
      (stickers, sticker) =>
        stickers.set(sticker.id, new Sticker(this.client, sticker)),
      new Collection<string, InstanceType<typeof Sticker>>()
    );
  }
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  splashURL({ format = "webp", size }: StaticImageURLOptions = {}) {
    return (
      this.splash &&
      this.client.rest.cdn.Splash(this.id, this.splash, format, size)
    );
  }

  discoverySplashURL({ format = "webp", size }: StaticImageURLOptions = {}) {
    return (
      this.discoverySplash &&
      this.client.rest.cdn.DiscoverySplash(
        this.id,
        this.discoverySplash,
        format,
        size
      )
    );
  }

  iconURL({ format = "webp", size, dynamic }: ImageURLOptions = {}) {
    return (
      this.icon &&
      this.client.rest.cdn.Icon(this.id, this.icon, format, size, dynamic)
    );
  }

  async fetch() {
    const data = await this.client.api
      .guilds(this.id)
      .preview.get<RawGuildPreviewData>();
    this._patch(data);
    return this;
  }

  toString() {
    return this.name;
  }

  toJSON() {
    const json = super.toJSON();
    json.iconURL = this.iconURL();
    json.splashURL = this.splashURL();
    return json;
  }
}

export default GuildPreview;
export { GuildPreview };
