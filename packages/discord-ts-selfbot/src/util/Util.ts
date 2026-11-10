import Sweepers from './Sweepers';
import { Agent } from 'node:http';
import nodePath from 'node:path';
import process from 'node:process';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import { fetch } from 'undici';
import type { APIIncidentsData, APIPartialEmoji } from 'discord-api-types/v10';
import type Client from '../client/Client';
import type { Message } from '../structures/Message';
import type { Modal } from '../structures/Modal';
import _ConstantsModule from './Constants';

const { Colors, Events } = _ConstantsModule;
import _errorsModule from '../errors';

const { Error: DiscordError, RangeError, TypeError } = _errorsModule;
import VoiceCodec from '../client/voice/util/VoiceCodec';
import type { UploadAttachment } from '../types/uploads';
import { isGuildBasedChannel } from '../types/channels';
import { createRequire } from 'node:module';
import type { Channel } from '../structures/Channel';

const require = createRequire(import.meta.url);

const has = (o: unknown, k: unknown) =>
  Object.hasOwn(o as object, k as PropertyKey);
const isObject = (d: unknown) => typeof d === 'object' && d !== null;
const isCodeChunk = (index: number, array: unknown[]) =>
  index % 2 > 0 && index !== array.length - 1;

let deprecationEmittedForSplitMessage = false;
let deprecationEmittedForRemoveMentions = false;
let deprecationEmittedForResolveAutoArchiveMaxLimit = false;

const TextSortableGroupTypes = [
  'GUILD_TEXT',
  'GUILD_ANNOUCMENT',
  'GUILD_FORUM',
];
const VoiceSortableGroupTypes = ['GUILD_VOICE', 'GUILD_STAGE_VOICE'];
const CategorySortableGroupTypes = ['GUILD_CATEGORY'];

class Util extends null {
  static flatten(obj: unknown, ...props: unknown[]): Record<string, unknown> {
    if (!isObject(obj)) {
      return obj as Record<string, unknown>;
    }

    const objProps = Object.keys(obj as Record<string, unknown>)
      .filter((key) => !key.startsWith('_'))
      .map((key) => ({ [key]: true }));

    props = (
      objProps.length
        ? (Object as { assign: (...args: unknown[]) => unknown }).assign(
            ...objProps,
            ...props
          )
        : (Object as { assign: (...args: unknown[]) => unknown }).assign(
            {},
            ...props
          )
    ) as unknown[];

    const out: Record<string, unknown> = {};

    for (const [prop, entry] of Object.entries(
      props as unknown as Record<string, unknown>
    )) {
      if (!entry) {
        continue;
      }
      const newProp = entry === true ? prop : entry;

      const element = (obj as Record<string, unknown>)[prop];
      const elemIsObj = isObject(element);
      const valueOf =
        elemIsObj &&
        typeof (element as { valueOf?: () => unknown }).valueOf === 'function'
          ? (element as { valueOf: () => unknown }).valueOf()
          : null;
      const hasToJSON =
        elemIsObj &&
        typeof (element as { toJSON?: unknown }).toJSON === 'function';

      // If it's a Collection, make the array of keys
      const key = newProp as string;
      if (element instanceof Collection) {
        out[key] = [...element.keys()];
      }
      // If the valueOf is a Collection, use its array of keys
      else if (valueOf instanceof Collection) {
        out[key] = [...valueOf.keys()];
      }
      // If it's an array, call toJSON function on each element if present, otherwise flatten each element
      else if (Array.isArray(element)) {
        out[key] = element.map(
          (e) => (e as { toJSON?: () => unknown }).toJSON?.() ?? Util.flatten(e)
        );
      }
      // If it's an object with a primitive `valueOf`, use that value
      else if (typeof valueOf !== 'object') {
        out[key] = valueOf;
      }
      // If it's an object with a toJSON function, use the return value of it
      else if (hasToJSON) {
        out[key] = (element as { toJSON: () => unknown }).toJSON();
      }
      // If element is an object, use the flattened version of it
      else if (typeof element === 'object') {
        out[key] = Util.flatten(element);
      }
      // If it's a primitive
      else if (!elemIsObj) {
        out[key] = element;
      }
    }

    return out;
  }

  /**
   * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
   * @param {string} text Content to split
   * @param {SplitOptions} [options] Options controlling the behavior of the split
   * @deprecated This will be removed in the next major version.
   * @returns {string[]}
   */
  static splitMessage(
    text: string,
    {
      maxLength = 2000,
      char = '\n',
      prepend = '',
      append = '',
    }: {
      maxLength?: number;
      char?: string | string[] | RegExp | RegExp[];
      prepend?: string;
      append?: string;
    } = {}
  ) {
    if (!deprecationEmittedForSplitMessage) {
      process.emitWarning(
        'The Util.splitMessage method is deprecated and will be removed in the next major version.',
        'DeprecationWarning'
      );

      deprecationEmittedForSplitMessage = true;
    }

    const content = Util.verifyString(text);
    if (content.length <= maxLength) {
      return [content];
    }
    let splitText = [content];
    if (Array.isArray(char)) {
      while (
        char.length > 0 &&
        splitText.some((elem) => elem.length > maxLength)
      ) {
        const currentChar = char.shift();
        splitText = splitText.flatMap((chunk) =>
          currentChar instanceof RegExp
            ? (chunk.match(currentChar) ?? [])
            : chunk.split(currentChar as string)
        ) as string[];
      }
    } else {
      splitText = content.split(char as string | RegExp);
    }
    if (splitText.some((elem) => elem.length > maxLength)) {
      throw new RangeError('SPLIT_MAX_LEN');
    }
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
      if (msg && (msg + char + chunk + append).length > maxLength) {
        messages.push(msg + append);
        msg = prepend;
      }
      msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return [...messages, msg].filter(Boolean);
  }

  static escapeMarkdown(
    text: string,
    options: {
      codeBlock?: boolean;
      inlineCode?: boolean;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      spoiler?: boolean;
      codeBlockContent?: boolean;
      inlineCodeContent?: boolean;
      escape?: boolean;
      heading?: boolean;
      bulletedList?: boolean;
      numberedList?: boolean;
      maskedLink?: boolean;
    } = {}
  ): string {
    const {
      codeBlock = true,
      inlineCode = true,
      bold = true,
      italic = true,
      underline = true,
      strikethrough = true,
      spoiler = true,
      escape = true,
      heading = false,
      bulletedList = false,
      numberedList = false,
      maskedLink = false,
    } = options;
    const codeBlockContent = options.codeBlockContent !== false;
    const inlineCodeContent = options.inlineCodeContent !== false;
    if (!codeBlockContent) {
      return text
        .split('```')
        .map((subString: unknown, index: number, array: unknown[]): unknown => {
          if (isCodeChunk(index, array)) {
            return subString;
          }
          return Util.escapeMarkdown(subString as string, {
            bold,
            bulletedList,
            escape,
            heading,
            inlineCode,
            inlineCodeContent,
            italic,
            maskedLink,
            numberedList,
            spoiler,
            strikethrough,
            underline,
          });
        })
        .join(codeBlock ? '\\`\\`\\`' : '```');
    }
    if (!inlineCodeContent) {
      return text
        .split(/(?<=^|[^`])`(?=[^`]|$)/gu)
        .map((subString: unknown, index: number, array: unknown[]): unknown => {
          if (isCodeChunk(index, array)) {
            return subString;
          }
          return Util.escapeMarkdown(subString as string, {
            bold,
            bulletedList,
            codeBlock,
            escape,
            heading,
            italic,
            maskedLink,
            numberedList,
            spoiler,
            strikethrough,
            underline,
          });
        })
        .join(inlineCode ? '\\`' : '`');
    }
    const escapers: [boolean, (value: string) => string][] = [
      [escape, Util.escapeEscape],
      [inlineCode, Util.escapeInlineCode],
      [codeBlock, Util.escapeCodeBlock],
      [italic, Util.escapeItalic],
      [bold, Util.escapeBold],
      [underline, Util.escapeUnderline],
      [strikethrough, Util.escapeStrikethrough],
      [spoiler, Util.escapeSpoiler],
      [heading, Util.escapeHeading],
      [bulletedList, Util.escapeBulletedList],
      [numberedList, Util.escapeNumberedList],
      [maskedLink, Util.escapeMaskedLink],
    ];
    let content = text;
    for (const [, escapeFn] of escapers.filter(([enabled]) => enabled)) {
      content = escapeFn(content);
    }
    return content;
  }

  static escapeCodeBlock(text: string) {
    return text.replaceAll('```', '\\`\\`\\`');
  }

  static escapeInlineCode(text: string) {
    return text.replaceAll(/(?<=^|[^`])``?(?=[^`]|$)/gu, (match) =>
      match.length === 2 ? '\\`\\`' : '\\`'
    );
  }

  static escapeItalic(text: string) {
    let count = 0;
    const withItalic = text.replaceAll(
      /(?<=^|[^*])\*(?<body>[^*]|\*\*|$)/gu,
      (_full, match) => {
        if (match === '**') {
          return ++count % 2 ? `\\*${match}` : `${match}\\*`;
        }
        return `\\*${match}`;
      }
    );
    count = 0;
    return withItalic.replaceAll(
      /(?<=^|[^_])_(?<body>[^_]|__|$)/gu,
      (_full, match) => {
        if (match === '__') {
          return ++count % 2 ? `\\_${match}` : `${match}\\_`;
        }
        return `\\_${match}`;
      }
    );
  }

  static escapeBold(text: string) {
    let count = 0;
    return text.replaceAll(/\*\*(?<body>\*)?/gu, (_full, match) => {
      if (match) {
        return ++count % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
      }
      return '\\*\\*';
    });
  }

  static escapeUnderline(text: string) {
    let count = 0;
    return text.replaceAll(/__(?<body>_)?/gu, (_full, match) => {
      if (match) {
        return ++count % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
      }
      return '\\_\\_';
    });
  }

  static escapeStrikethrough(text: string) {
    return text.replaceAll('~~', '\\~\\~');
  }

  static escapeSpoiler(text: string) {
    return text.replaceAll('||', '\\|\\|');
  }

  static escapeEscape(text: string) {
    return text.replaceAll('\\', '\\\\');
  }

  static escapeHeading(text: string) {
    return text.replaceAll(
      /^(?<prefix> {0,2}[*-] +)?(?<heading>#{1,3} )/gmu,
      '$1\\$2'
    );
  }

  static escapeBulletedList(text: string) {
    return text.replaceAll(/^(?<indent> *)[*-](?<spaces> +)/gmu, '$1\\-$2');
  }

  static escapeNumberedList(text: string) {
    return text.replaceAll(/^(?<indent> *\d+)\./gmu, '$1\\.');
  }

  static escapeMaskedLink(text: string) {
    return text.replaceAll(/\[(?<text>.+)\]\((?<url>.+)\)/gmu, '\\$&');
  }

  static fetchRecommendedShards() {
    throw new DiscordError('INVALID_USER_API');
  }

  static parseEmoji(text: string) {
    const content = text.includes('%') ? decodeURIComponent(text) : text;
    if (!content.includes(':')) {
      return { animated: false, id: null, name: content };
    }
    const match = content.match(
      /<?(?:(?<animated>a):)?(?<name>\w{2,32}):(?<id>\d{17,19})?>?/u
    );
    return (
      match && {
        animated: Boolean(match[1]),
        id: match[3] ?? null,
        name: match[2],
      }
    );
  }

  static resolvePartialEmoji(emoji: unknown): APIPartialEmoji | null {
    if (!emoji) {
      return null;
    }
    if (typeof emoji === 'string') {
      if (/^\d{17,19}$/u.test(emoji)) {
        return { id: emoji, name: null };
      }
      const parsed = Util.parseEmoji(emoji);
      if (!parsed) {
        return null;
      }
      return {
        animated: parsed.animated,
        id: parsed.id ?? null,
        name: parsed.name,
      };
    }
    if (typeof emoji !== 'object') {
      return null;
    }
    const id = 'id' in emoji ? emoji.id : undefined;
    const name = 'name' in emoji ? emoji.name : undefined;
    const animated = 'animated' in emoji ? emoji.animated : undefined;
    if (!id && !name) {
      return null;
    }
    return {
      animated: Boolean(animated),
      id: typeof id === 'string' ? id : null,
      name: typeof name === 'string' ? name : null,
    };
  }

  static cloneObject(obj: unknown) {
    return Object.assign(Object.create(obj as object), obj);
  }

  static mergeDefault<Shape extends object>(def: Shape, given?: object): Shape;
  static mergeDefault(def: unknown, given?: unknown): unknown;
  static mergeDefault(def: unknown, given?: unknown): unknown {
    if (!given) {
      return def;
    }
    const defaults = def as Record<string, unknown>;
    const target = given as Record<string, unknown>;
    for (const key in defaults) {
      if (!has(target, key) || target[key] === undefined) {
        target[key] = defaults[key];
      } else if (target[key] === Object(target[key])) {
        target[key] = Util.mergeDefault(defaults[key], target[key]);
      }
    }

    return target;
  }

  static makeError(obj: unknown) {
    const data = typeof obj === 'object' && obj !== null ? obj : {};
    const err = new Error(String('message' in data ? data.message : obj));
    err.name = String('name' in data ? data.name : 'Error');
    const stack = 'stack' in data ? data.stack : undefined;
    if (typeof stack === 'string') {
      err.stack = stack;
    }
    return err;
  }

  static makePlainError(err: unknown) {
    if (err instanceof Error) {
      return { message: err.message, name: err.name, stack: err.stack };
    }
    return { message: String(err), name: 'Error', stack: undefined };
  }

  static moveElementInArray(
    array: unknown[],
    element: unknown,
    newIndex: number,
    offset = false
  ) {
    const index = array.indexOf(element);
    const targetIndex = (offset ? index : 0) + newIndex;
    if (targetIndex > -1 && targetIndex < array.length) {
      const [removedElement] = array.splice(index, 1);
      array.splice(targetIndex, 0, removedElement);
    }
    return array.indexOf(element);
  }

  static verifyString(
    data: unknown,
    error: new (message: string) => Error = Error,
    errorMessage = `Expected a string, got ${data} instead.`,
    allowEmpty = true
  ) {
    if (typeof data !== 'string') {
      throw new error(errorMessage);
    }
    if (!allowEmpty && data.length === 0) {
      throw new error(errorMessage);
    }
    return data;
  }

  static resolveColor(color: unknown) {
    let resolved = color;
    if (typeof color === 'string') {
      if (color === 'RANDOM') {
        return Math.floor(Math.random() * (0xff_ff_ff + 1));
      }
      if (color === 'DEFAULT') {
        return 0;
      }
      resolved =
        Colors[color as string] ??
        Number.parseInt((color as string).replace('#', ''), 16);
    } else if (Array.isArray(color)) {
      resolved = (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if ((resolved as number) < 0 || (resolved as number) > 0xff_ff_ff) {
      throw new RangeError('COLOR_RANGE');
    } else if (Number.isNaN(resolved)) {
      throw new TypeError('COLOR_CONVERT');
    }

    return resolved as number;
  }

  static discordSort(
    collection: unknown
  ): Collection<string, { id: string; rawPosition: number }> {
    const GuildChannel = require('../structures/GuildChannel');
    const sortable = collection as {
      first: () => unknown;
      toSorted: (
        fn: (first: unknown, second: unknown) => number
      ) => Collection<string, { id: string; rawPosition: number }>;
    };
    const isGuildChannel = sortable.first() instanceof GuildChannel;
    return sortable.toSorted(
      isGuildChannel
        ? (first: unknown, second: unknown) =>
            (first as { rawPosition: number; id: string }).rawPosition -
              (second as { rawPosition: number; id: string }).rawPosition ||
            Number(
              BigInt((first as { id: string }).id) -
                BigInt((second as { id: string }).id)
            )
        : (first: unknown, second: unknown) =>
            (first as { rawPosition: number; id: string }).rawPosition -
              (second as { rawPosition: number; id: string }).rawPosition ||
            Number(
              BigInt((second as { id: string }).id) -
                BigInt((first as { id: string }).id)
            )
    );
  }

  static async setPosition<Item extends { id: unknown }>(
    item: Item,
    position: number,
    relative: boolean,
    sorted: { values: () => Iterable<Item> },
    route: { patch: (o: unknown) => Promise<unknown> },
    reason?: string
  ) {
    const sortedValues = [...sorted.values()];
    Util.moveElementInArray(sortedValues, item, position, relative);
    const updatedItems = sortedValues.map((entry, index) => ({
      id: entry.id,
      position: index,
    }));
    await route.patch({ data: updatedItems, reason });
    return updatedItems;
  }

  static basename(path: unknown, ext?: unknown) {
    const res = nodePath.parse(path as string);
    return ext && res.ext.startsWith(ext as string)
      ? res.name
      : res.base.split('?')[0];
  }

  /**
   * Breaks user, role and everyone/here mentions by adding a zero width space after every @ character
   * @param {string} str The string to sanitize
   * @returns {string}
   * @deprecated Use {@link BaseMessageOptions#allowedMentions} instead.
   */
  static removeMentions(str: string) {
    if (!deprecationEmittedForRemoveMentions) {
      process.emitWarning(
        'The Util.removeMentions method is deprecated. Use MessageOptions#allowedMentions instead.',
        'DeprecationWarning'
      );

      deprecationEmittedForRemoveMentions = true;
    }

    return Util._removeMentions(str);
  }

  static _removeMentions(str: string) {
    return str.replaceAll('@', '@\u200B');
  }

  static cleanContent(str: string, channel: Channel) {
    const guild = isGuildBasedChannel(channel) ? channel.guild : null;
    const content = str
      .replaceAll(/<@!?[0-9]+>/gu, (input) => {
        const id = input.replaceAll(/<|!|>|@/gu, '');
        if (channel.type === 'DM') {
          const user = channel.client.users.cache.get(id);
          return user ? Util._removeMentions(`@${user.username}`) : input;
        }

        const member = guild?.members.cache.get(id);
        if (member) {
          return Util._removeMentions(`@${member.displayName}`);
        }
        const user = channel.client.users.cache.get(id);
        return user ? Util._removeMentions(`@${user.username}`) : input;
      })
      .replaceAll(/<#[0-9]+>/gu, (input) => {
        const mentionedChannel = channel.client.channels.cache.get(
          input.replaceAll(/<|#|>/gu, '')
        );
        if (
          !mentionedChannel ||
          !('name' in mentionedChannel) ||
          typeof mentionedChannel.name !== 'string'
        ) {
          return input;
        }
        return `#${mentionedChannel.name}`;
      })
      .replaceAll(/<@&[0-9]+>/gu, (input) => {
        if (channel.type === 'DM' || !guild) {
          return input;
        }
        const role = guild.roles.cache.get(input.replaceAll(/<|@|>|&/gu, ''));
        return role ? `@${role.name}` : input;
      });
    return content;
  }

  static cleanCodeBlockContent(text: string) {
    return text.replaceAll('```', '`\u200B``');
  }

  /**
   * Creates a sweep filter that sweeps archived threads
   * @param {number} [lifetime=14400] How long a thread has to be archived to be valid for sweeping
   * @deprecated When not using with `makeCache` use `Sweepers.archivedThreadSweepFilter` instead
   * @returns {SweepFilter}
   */
  static archivedThreadSweepFilter(lifetime = 14_400) {
    const filter = Sweepers.archivedThreadSweepFilter(lifetime);
    (filter as { isDefault?: boolean }).isDefault = true;
    return filter;
  }

  /**
   * Resolves the maximum time a guild's thread channels should automatically archive in case of no recent activity.
   * @param {Guild} guild The guild to resolve this limit from.
   * @deprecated This will be removed in the next major version.
   * @returns {number}
   */
  static resolveAutoArchiveMaxLimit(_guild: unknown = null) {
    if (!deprecationEmittedForResolveAutoArchiveMaxLimit) {
      process.emitWarning(
        "The Util.resolveAutoArchiveMaxLimit method and the 'MAX' option are deprecated and will be removed in the next major version.",
        'DeprecationWarning'
      );
      deprecationEmittedForResolveAutoArchiveMaxLimit = true;
    }
    return 10_080;
  }

  static transformAPIGuildForumTag(tag: {
    id?: unknown;
    name?: unknown;
    moderated?: unknown;
    emoji_id?: unknown;
    emoji_name?: unknown;
  }): {
    id: string;
    name: string;
    moderated: boolean;
    emoji: { id: string | null; name: string | null } | null;
  } {
    return {
      emoji:
        typeof tag.emoji_id === 'string' || typeof tag.emoji_name === 'string'
          ? {
              id: typeof tag.emoji_id === 'string' ? tag.emoji_id : null,
              name: typeof tag.emoji_name === 'string' ? tag.emoji_name : null,
            }
          : null,
      id: typeof tag.id === 'string' ? tag.id : '',
      moderated: Boolean(tag.moderated),
      name: typeof tag.name === 'string' ? tag.name : '',
    };
  }

  static transformGuildForumTag(tag: {
    id?: unknown;
    name?: unknown;
    moderated?: unknown;
    emoji?: unknown;
  }) {
    return {
      emoji_id: (tag.emoji as { id?: unknown } | null)?.id ?? null,
      emoji_name: (tag.emoji as { name?: unknown } | null)?.name ?? null,
      id: tag.id,
      moderated: tag.moderated,
      name: tag.name,
    };
  }

  static transformAPIGuildDefaultReaction(defaultReaction: {
    emoji_id?: unknown;
    emoji_name?: unknown;
  }): {
    id: string | null;
    name: string | null;
  } {
    return {
      id:
        typeof defaultReaction.emoji_id === 'string'
          ? defaultReaction.emoji_id
          : null,
      name:
        typeof defaultReaction.emoji_name === 'string'
          ? defaultReaction.emoji_name
          : null,
    };
  }

  static transformGuildDefaultReaction(defaultReaction: {
    id?: unknown;
    name?: unknown;
  }) {
    return {
      emoji_id: defaultReaction.id,
      emoji_name: defaultReaction.name,
    };
  }

  static transformGuildScheduledEventRecurrenceRule(
    recurrenceRule: Record<string, unknown>
  ) {
    return {
      by_month: recurrenceRule.byMonth,
      by_month_day: recurrenceRule.byMonthDay,
      by_n_weekday: recurrenceRule.byNWeekday,
      by_weekday: recurrenceRule.byWeekday,
      frequency: recurrenceRule.frequency,
      interval: recurrenceRule.interval,
      start: new Date(recurrenceRule.startAt as string).toISOString(),
    };
  }

  static transformAPIIncidentsData(data: APIIncidentsData) {
    return {
      dmSpamDetectedAt: data.dm_spam_detected_at
        ? new Date(data.dm_spam_detected_at)
        : null,
      dmsDisabledUntil: data.dms_disabled_until
        ? new Date(data.dms_disabled_until)
        : null,
      invitesDisabledUntil: data.invites_disabled_until
        ? new Date(data.invites_disabled_until)
        : null,
      raidDetectedAt: data.raid_detected_at
        ? new Date(data.raid_detected_at)
        : null,
    };
  }

  static getSortableGroupTypes(type: unknown) {
    switch (type) {
      case 'GUILD_TEXT':
      case 'GUILD_ANNOUNCEMENT':
      case 'GUILD_FORUM': {
        return TextSortableGroupTypes;
      }
      case 'GUILD_VOICE':
      case 'GUILD_STAGE_VOICE': {
        return VoiceSortableGroupTypes;
      }
      case 'GUILD_CATEGORY': {
        return CategorySortableGroupTypes;
      }
      default: {
        return [type];
      }
    }
  }

  static calculateUserDefaultAvatarIndex(userId: unknown) {
    return Number(BigInt(userId as string | number | bigint) >> 22n) % 6;
  }

  static async getUploadURL(
    client: unknown,
    channelId: unknown,
    files: unknown[]
  ): Promise<UploadAttachment[]> {
    if (!files.length) {
      return [];
    }
    const uploadFiles = files.map((file: unknown, index: number) => ({
      // 25MB = 26_214_400bytes
      file_size: Math.floor((26_214_400 / 10) * Math.random()),
      filename: (file as { name?: string }).name,
      id: `${index}`,
    }));
    const clientApi = client as {
      api: {
        channels: Record<
          string,
          {
            attachments: {
              post: (
                o: unknown
              ) => Promise<{ attachments: UploadAttachment[] }>;
            };
          }
        >;
      };
    };
    const { attachments } = await clientApi.api.channels[
      String(channelId)
    ].attachments.post({
      data: {
        files: uploadFiles,
      },
    });
    return attachments;
  }

  static async uploadFile(data: unknown, url: unknown) {
    const response = await fetch(url as string, {
      body: data as never,
      // Node.js v20 requires the half duplex option for streamed bodies.
      duplex: 'half',
      method: 'PUT',
    });
    if (!response.ok) {
      throw response;
    }
    return response;
  }

  static lazy(factory: unknown) {
    let defaultValue: unknown;
    return () => (defaultValue ??= (factory as () => unknown)());
  }

  static verifyProxyAgent(object: unknown): object is Agent {
    const o = object as { httpAgent?: unknown; httpsAgent?: unknown };
    return (
      typeof object === 'object' &&
      o.httpAgent instanceof Agent &&
      o.httpsAgent instanceof Agent
    );
  }

  static checkUndiciProxyAgent(data: unknown) {
    if (typeof data === 'string') {
      return {
        uri: data,
      };
    }
    if (data instanceof URL) {
      return {
        uri: data.toString(),
      };
    }
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as { uri?: unknown }).uri === 'string'
    ) {
      return data as { uri: string };
    }
    return false;
  }

  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs?: number,
    isHandlerDeferUpdate?: boolean,
    parent?: Message | Modal
  ): Promise<Message | Modal>;
  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs?: number,
    isHandlerDeferUpdate?: boolean,
    parent?: undefined
  ): Promise<Message>;
  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs = 5000,
    isHandlerDeferUpdate = false,
    parent?: Message | Modal
  ): Promise<unknown> {
    const { promise, reject, resolve } = Promise.withResolvers<unknown>();
    // Waiting for MsgCreate / ModalCreate
    let dataFromInteractionSuccess: unknown;
    let dataFromNormalEvent: unknown;
    const timer = {} as { id: ReturnType<typeof setTimeout> };
    const handler = (data: unknown) => {
      // UnhandledPacket
      const packet = data as {
        d?: { nonce?: unknown };
        nonce?: unknown;
      } & Record<string, unknown>;
      if (
        isHandlerDeferUpdate &&
        packet.d?.nonce === nonce &&
        packet['t'] === 'INTERACTION_SUCCESS'
      ) {
        // Interaction#deferUpdate
        client.removeListener(Events.MESSAGE_CREATE, handler);
        client.removeListener(Events.UNHANDLED_PACKET, handler);
        client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
        dataFromInteractionSuccess = parent;
      }
      if (packet.nonce !== nonce) {
        return;
      }
      clearTimeout(timer.id);
      client.removeListener(Events.MESSAGE_CREATE, handler);
      client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
      if (isHandlerDeferUpdate) {
        client.removeListener(Events.UNHANDLED_PACKET, handler);
      }
      client.decrementMaxListeners();
      dataFromNormalEvent = data;
      resolve(data);
    };
    timer.id = setTimeout(() => {
      if (dataFromInteractionSuccess || dataFromNormalEvent) {
        resolve(dataFromNormalEvent || dataFromInteractionSuccess);
        return;
      }
      client.removeListener(Events.MESSAGE_CREATE, handler);
      client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
      if (isHandlerDeferUpdate) {
        client.removeListener(Events.UNHANDLED_PACKET, handler);
      }
      client.decrementMaxListeners();
      reject(new DiscordError('INTERACTION_FAILED'));
    }, timeoutMs).unref();
    client.incrementMaxListeners();
    client.on(Events.MESSAGE_CREATE, handler);
    client.on(Events.INTERACTION_MODAL_CREATE, handler);
    if (isHandlerDeferUpdate) {
      client.on(Events.UNHANDLED_PACKET, handler);
    }
    return promise;
  }

  static clearNullOrUndefinedObject(object: unknown) {
    const data: Record<string, unknown> = {};
    const keys = Object.keys(object as Record<string, unknown>);

    for (const key of keys) {
      const value = (object as Record<string, unknown>)[key];
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      ) {
        continue;
      } else if (!Array.isArray(value) && typeof value === 'object') {
        const cleanedValue = Util.clearNullOrUndefinedObject(value);
        if (cleanedValue !== undefined) {
          data[key] = cleanedValue;
        }
      } else {
        data[key] = value;
      }
    }

    return Object.keys(data).length > 0 ? data : undefined;
  }

  static getAllPayloadType() {
    return VoiceCodec.getAllPayloadType();
  }

  static getPayloadType(codecName: string) {
    return VoiceCodec.getPayloadType(codecName);
  }

  static getSDPCodecName(
    portUdpH264: number | null,
    portUdpH265: number | null,
    portUdpOpus: number | null
  ) {
    return VoiceCodec.getSDPCodecName(portUdpH264, portUdpH265, portUdpOpus);
  }
}

export default Util;
export { Util };

// Fixes Circular
