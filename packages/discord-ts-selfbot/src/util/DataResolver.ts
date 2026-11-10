import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import { fetch } from "undici";
import _errorsModule from "../errors";

const { Error: DiscordError, TypeError } = _errorsModule;
import Invite from "../structures/Invite";
import GuildTemplate from "../structures/GuildTemplate";

("use strict");

class DataResolver extends null {
  static resolveCode(data: unknown, regex: RegExp) {
    return new RegExp(regex.source).exec(String(data))?.[1] ?? (data as string);
  }

  static resolveInviteCode(data: unknown) {
    return this.resolveCode(data, Invite.INVITES_PATTERN);
  }

  static resolveGuildTemplateCode(data: unknown) {
    return this.resolveCode(data, GuildTemplate.GUILD_TEMPLATES_PATTERN);
  }

  static async resolveImage(image: unknown) {
    if (!image) {
      return null;
    }
    if (typeof image === "string" && image.startsWith("data:")) {
      return image;
    }
    const file = await this.resolveFileAsBuffer(image);
    return DataResolver.resolveBase64(file);
  }

  static resolveBase64(data: unknown) {
    if (Buffer.isBuffer(data)) {
      return `data:image/jpg;base64,${data.toString("base64")}`;
    }
    return data as string;
  }

  static async resolveFile(resource: unknown) {
    if (Buffer.isBuffer(resource) || resource instanceof stream.Readable) {
      return resource;
    }
    if (typeof resource === "string") {
      if (/^https?:\/\//.test(resource)) {
        const res = await fetch(resource);
        if (res.ok) {
          return res.body;
        } else {
          throw new DiscordError("FILE_NOT_FOUND", resource);
        }
      }

      return new Promise<stream.Readable>((resolve, reject) => {
        const file = path.resolve(resource);
        fs.stat(file, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
          if (err) {
            return reject(err);
          }
          if (!stats.isFile()) {
            return reject(new DiscordError("FILE_NOT_FOUND", file));
          }
          return resolve(fs.createReadStream(file));
        });
      });
    }

    throw new TypeError("REQ_RESOURCE_TYPE");
  }

  static async resolveFileAsBuffer(resource: unknown) {
    const file = await this.resolveFile(resource);
    if (Buffer.isBuffer(file)) {
      return file;
    }
    if (!file) {
      throw new DiscordError("FILE_NOT_FOUND", String(resource));
    }

    const buffers = [];
    for await (const data of file as AsyncIterable<Buffer>) {
      buffers.push(data);
    }
    return Buffer.concat(buffers);
  }
}

export default DataResolver;
export { DataResolver };
