import Sweepers from './Sweepers';
import { Agent } from 'node:http';
import { parse } from 'node:path';
import process from 'node:process';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import { fetch } from 'undici';
import type { APIPartialEmoji } from 'discord-api-types/v10';
import type Client from '../client/Client';
import type { Message } from '../structures/Message';
import type { Modal } from '../structures/Modal';
import _ConstantsModule from './Constants';
const { Colors, Events } = _ConstantsModule;
import _errorsModule from '../errors';
const { Error: DiscordError, RangeError, TypeError } = _errorsModule;
import VoiceCodec from '../client/voice/util/VoiceCodec';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
('use strict');

const has = (o: unknown, k: unknown) => Object.prototype.hasOwnProperty.call(o as object, k as PropertyKey);
const isObject = (d: unknown) => typeof d === 'object' && d !== null;

let deprecationEmittedForSplitMessage = false;
let deprecationEmittedForRemoveMentions = false;
let deprecationEmittedForResolveAutoArchiveMaxLimit = false;

const TextSortableGroupTypes = ['GUILD_TEXT', 'GUILD_ANNOUCMENT', 'GUILD_FORUM'];
const VoiceSortableGroupTypes = ['GUILD_VOICE', 'GUILD_STAGE_VOICE'];
const CategorySortableGroupTypes = ['GUILD_CATEGORY'];

/**
 * Contains various general-purpose utility methods.
 */
class Util extends null {
  /**
   * Flatten an object. Any properties that are collections will get converted to an array of keys.
   * @param {Object} obj The object to flatten.
   * @param {...Object<string, boolean|string>} [props] Specific properties to include/exclude.
   * @returns {Object}
   */
  static flatten(obj: unknown, ...props: unknown[]): Record<string, unknown> {
    if (!isObject(obj)) return obj as Record<string, unknown>;

    const objProps = Object.keys(obj as Record<string, unknown>)
      .filter(k => !k.startsWith('_'))
      .map(k => ({ [k]: true }));

    props = (
      objProps.length
        ? (Object as { assign: (...a: unknown[]) => unknown }).assign(...objProps, ...props)
        : (Object as { assign: (...a: unknown[]) => unknown }).assign({}, ...props)
    ) as unknown[];

    const out: Record<string, unknown> = {};

    for (let [prop, newProp] of Object.entries(props as unknown as Record<string, unknown>)) {
      if (!newProp) continue;
      newProp = newProp === true ? prop : newProp;

      const element = (obj as Record<string, unknown>)[prop];
      const elemIsObj = isObject(element);
      const valueOf =
        elemIsObj && typeof (element as { valueOf?: () => unknown }).valueOf === 'function'
          ? (element as { valueOf: () => unknown }).valueOf()
          : null;
      const hasToJSON = elemIsObj && typeof (element as { toJSON?: unknown }).toJSON === 'function';

      // If it's a Collection, make the array of keys
      const key = newProp as string;
      if (element instanceof Collection) out[key] = Array.from(element.keys());
      // If the valueOf is a Collection, use its array of keys
      else if (valueOf instanceof Collection) out[key] = Array.from(valueOf.keys());
      // If it's an array, call toJSON function on each element if present, otherwise flatten each element
      else if (Array.isArray(element))
        out[key] = element.map(e => (e as { toJSON?: () => unknown }).toJSON?.() ?? Util.flatten(e));
      // If it's an object with a primitive `valueOf`, use that value
      else if (typeof valueOf !== 'object') out[key] = valueOf;
      // If it's an object with a toJSON function, use the return value of it
      else if (hasToJSON) out[key] = (element as { toJSON: () => unknown }).toJSON();
      // If element is an object, use the flattened version of it
      else if (typeof element === 'object') out[key] = Util.flatten(element);
      // If it's a primitive
      else if (!elemIsObj) out[key] = element;
    }

    return out;
  }

  /**
   * Options for splitting a message.
   * @typedef {Object} SplitOptions
   * @property {number} [maxLength=2000] Maximum character length per message piece
   * @property {string|string[]|RegExp|RegExp[]} [char='\n'] Character(s) or Regex(es) to split the message with,
   * an array can be used to split multiple times
   * @property {string} [prepend=''] Text to prepend to every piece except the first
   * @property {string} [append=''] Text to append to every piece except the last
   */

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
      maxLength = 2_000,
      char = '\n',
      prepend = '',
      append = '',
    }: { maxLength?: number; char?: string | string[] | RegExp | RegExp[]; prepend?: string; append?: string } = {},
  ) {
    if (!deprecationEmittedForSplitMessage) {
      process.emitWarning(
        'The Util.splitMessage method is deprecated and will be removed in the next major version.',
        'DeprecationWarning',
      );

      deprecationEmittedForSplitMessage = true;
    }

    text = Util.verifyString(text);
    if (text.length <= maxLength) return [text];
    let splitText = [text];
    if (Array.isArray(char)) {
      while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
        const currentChar = char.shift();
        if (currentChar instanceof RegExp) {
          splitText = splitText.flatMap(chunk => chunk.match(currentChar) ?? []) as string[];
        } else {
          splitText = splitText.flatMap(chunk => chunk.split(currentChar as string));
        }
      }
    } else {
      splitText = text.split(char as string | RegExp);
    }
    if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
      if (msg && (msg + char + chunk + append).length > maxLength) {
        messages.push(msg + append);
        msg = prepend;
      }
      msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return messages.concat(msg).filter(m => m);
  }

  /**
   * Options used to escape markdown.
   * @typedef {Object} EscapeMarkdownOptions
   * @property {boolean} [codeBlock=true] Whether to escape code blocks
   * @property {boolean} [inlineCode=true] Whether to escape inline code
   * @property {boolean} [bold=true] Whether to escape bolds
   * @property {boolean} [italic=true] Whether to escape italics
   * @property {boolean} [underline=true] Whether to escape underlines
   * @property {boolean} [strikethrough=true] Whether to escape strikethroughs
   * @property {boolean} [spoiler=true] Whether to escape spoilers
   * @property {boolean} [codeBlockContent=true] Whether to escape text inside code blocks
   * @property {boolean} [inlineCodeContent=true] Whether to escape text inside inline code
   * @property {boolean} [escape=true] Whether to escape escape characters
   * @property {boolean} [heading=false] Whether to escape headings
   * @property {boolean} [bulletedList=false] Whether to escape bulleted lists
   * @property {boolean} [numberedList=false] Whether to escape numbered lists
   * @property {boolean} [maskedLink=false] Whether to escape masked links
   */

  /**
   * Escapes any Discord-flavour markdown in a string.
   * @param {string} text Content to escape
   * @param {EscapeMarkdownOptions} [options={}] Options for escaping the markdown
   * @returns {string}
   */
  static escapeMarkdown(
    text: string,
    {
      codeBlock = true,
      inlineCode = true,
      bold = true,
      italic = true,
      underline = true,
      strikethrough = true,
      spoiler = true,
      codeBlockContent = true,
      inlineCodeContent = true,
      escape = true,
      heading = false,
      bulletedList = false,
      numberedList = false,
      maskedLink = false,
    }: {
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
    } = {},
  ): string {
    if (!codeBlockContent) {
      return text
        .split('```')
        .map((subString: unknown, index: number, array: unknown[]): unknown => {
          if (index % 2 && index !== array.length - 1) return subString;
          return Util.escapeMarkdown(subString as string, {
            inlineCode,
            bold,
            italic,
            underline,
            strikethrough,
            spoiler,
            inlineCodeContent,
            escape,
            heading,
            bulletedList,
            numberedList,
            maskedLink,
          });
        })
        .join(codeBlock ? '\\`\\`\\`' : '```');
    }
    if (!inlineCodeContent) {
      return text
        .split(/(?<=^|[^`])`(?=[^`]|$)/g)
        .map((subString: unknown, index: number, array: unknown[]): unknown => {
          if (index % 2 && index !== array.length - 1) return subString;
          return Util.escapeMarkdown(subString as string, {
            codeBlock,
            bold,
            italic,
            underline,
            strikethrough,
            spoiler,
            escape,
            heading,
            bulletedList,
            numberedList,
            maskedLink,
          });
        })
        .join(inlineCode ? '\\`' : '`');
    }
    if (escape) text = Util.escapeEscape(text);
    if (inlineCode) text = Util.escapeInlineCode(text);
    if (codeBlock) text = Util.escapeCodeBlock(text);
    if (italic) text = Util.escapeItalic(text);
    if (bold) text = Util.escapeBold(text);
    if (underline) text = Util.escapeUnderline(text);
    if (strikethrough) text = Util.escapeStrikethrough(text);
    if (spoiler) text = Util.escapeSpoiler(text);
    if (heading) text = Util.escapeHeading(text);
    if (bulletedList) text = Util.escapeBulletedList(text);
    if (numberedList) text = Util.escapeNumberedList(text);
    if (maskedLink) text = Util.escapeMaskedLink(text);
    return text;
  }

  /**
   * Escapes code block markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeCodeBlock(text: string) {
    return text.replaceAll('```', '\\`\\`\\`');
  }

  /**
   * Escapes inline code markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeInlineCode(text: string) {
    return text.replace(/(?<=^|[^`])``?(?=[^`]|$)/g, match => (match.length === 2 ? '\\`\\`' : '\\`'));
  }

  /**
   * Escapes italic markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeItalic(text: string) {
    let i = 0;
    text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
      if (match === '**') return ++i % 2 ? `\\*${match}` : `${match}\\*`;
      return `\\*${match}`;
    });
    i = 0;
    return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
      if (match === '__') return ++i % 2 ? `\\_${match}` : `${match}\\_`;
      return `\\_${match}`;
    });
  }

  /**
   * Escapes bold markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeBold(text: string) {
    let i = 0;
    return text.replace(/\*\*(\*)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
      return '\\*\\*';
    });
  }

  /**
   * Escapes underline markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeUnderline(text: string) {
    let i = 0;
    return text.replace(/__(_)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
      return '\\_\\_';
    });
  }

  /**
   * Escapes strikethrough markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeStrikethrough(text: string) {
    return text.replaceAll('~~', '\\~\\~');
  }

  /**
   * Escapes spoiler markdown in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeSpoiler(text: string) {
    return text.replaceAll('||', '\\|\\|');
  }

  /**
   * Escapes escape characters in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeEscape(text: string) {
    return text.replaceAll('\\', '\\\\');
  }

  /**
   * Escapes heading characters in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeHeading(text: string) {
    return text.replaceAll(/^( {0,2}[*-] +)?(#{1,3} )/gm, '$1\\$2');
  }

  /**
   * Escapes bulleted list characters in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeBulletedList(text: string) {
    return text.replaceAll(/^( *)[*-]( +)/gm, '$1\\-$2');
  }

  /**
   * Escapes numbered list characters in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeNumberedList(text: string) {
    return text.replaceAll(/^( *\d+)\./gm, '$1\\.');
  }

  /**
   * Escapes masked link characters in a string.
   * @param {string} text Content to escape
   * @returns {string}
   */
  static escapeMaskedLink(text: string) {
    return text.replaceAll(/\[.+\]\(.+\)/gm, '\\$&');
  }

  /**
   * @typedef {Object} FetchRecommendedShardsOptions
   * @property {number} [guildsPerShard=1000] Number of guilds assigned per shard
   * @property {number} [multipleOf=1] The multiple the shard count should round up to. (16 for large bot sharding)
   */

  static fetchRecommendedShards() {
    throw new DiscordError('INVALID_USER_API');
  }

  /**
   * Parses emoji info out of a string. The string must be one of:
   * * A UTF-8 emoji (no id)
   * * A URL-encoded UTF-8 emoji (no id)
   * * A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
   * @param {string} text Emoji string to parse
   * @returns {APIEmoji} Object with `animated`, `name`, and `id` properties
   * @private
   */
  static parseEmoji(text: string) {
    if (text.includes('%')) text = decodeURIComponent(text);
    if (!text.includes(':')) return { animated: false, name: text, id: null };
    const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
    return match && { animated: Boolean(match[1]), name: match[2], id: match[3] ?? null };
  }

  /**
   * Resolves a partial emoji object from an {@link EmojiIdentifierResolvable}, without checking a Client.
   * @param {EmojiIdentifierResolvable} emoji Emoji identifier to resolve
   * @returns {?RawEmoji}
   * @private
   */
  static resolvePartialEmoji(emoji: unknown): APIPartialEmoji | null {
    if (!emoji) return null;
    if (typeof emoji === 'string') {
      if (/^\d{17,19}$/.test(emoji)) return { id: emoji, name: null };
      const parsed = Util.parseEmoji(emoji);
      if (!parsed) return null;
      return { id: parsed.id ?? null, name: parsed.name, animated: parsed.animated };
    }
    if (typeof emoji !== 'object') return null;
    const id = 'id' in emoji ? emoji.id : undefined;
    const name = 'name' in emoji ? emoji.name : undefined;
    const animated = 'animated' in emoji ? emoji.animated : undefined;
    if (!id && !name) return null;
    return {
      id: typeof id === 'string' ? id : null,
      name: typeof name === 'string' ? name : null,
      animated: Boolean(animated),
    };
  }

  /**
   * Shallow-copies an object with its class/prototype intact.
   * @param {Object} obj Object to clone
   * @returns {Object}
   * @private
   */
  static cloneObject(obj: unknown) {
    return Object.assign(Object.create(obj as object), obj);
  }

  /**
   * Sets default properties on an object that aren't already specified.
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   * @private
   */
  static mergeDefault(def: unknown, given?: unknown) {
    if (!given) return def;
    const d = def as Record<string, unknown>;
    const g = given as Record<string, unknown>;
    for (const key in d) {
      if (!has(g, key) || g[key] === undefined) {
        g[key] = d[key];
      } else if (g[key] === Object(g[key])) {
        g[key] = Util.mergeDefault(d[key], g[key]);
      }
    }

    return given;
  }

  /**
   * Options used to make an error object.
   * @typedef {Object} MakeErrorOptions
   * @property {string} name Error type
   * @property {string} message Message for the error
   * @property {string} stack Stack for the error
   */

  /**
   * Makes an Error from a plain info object.
   * @param {MakeErrorOptions} obj Error info
   * @returns {Error}
   * @private
   */
  static makeError(obj: Record<string, unknown>) {
    const err = new Error(String(obj.message));
    err.name = String(obj.name);
    err.stack = obj.stack as string;
    return err;
  }

  /**
   * Makes a plain error info object from an Error.
   * @param {Error} err Error to get info from
   * @returns {MakeErrorOptions}
   * @private
   */
  static makePlainError(err: Record<string, unknown>) {
    return {
      name: err.name as string,
      message: err.message as string,
      stack: err.stack as string,
    };
  }

  /**
   * Moves an element in an array *in place*.
   * @param {Array<*>} array Array to modify
   * @param {*} element Element to move
   * @param {number} newIndex Index or offset to move the element to
   * @param {boolean} [offset=false] Move the element by an offset amount rather than to a set index
   * @returns {number}
   * @private
   */
  static moveElementInArray(array: unknown[], element: unknown, newIndex: number, offset = false) {
    const index = array.indexOf(element);
    newIndex = (offset ? index : 0) + newIndex;
    if (newIndex > -1 && newIndex < array.length) {
      const removedElement = array.splice(index, 1)[0];
      array.splice(newIndex, 0, removedElement);
    }
    return array.indexOf(element);
  }

  /**
   * Verifies the provided data is a string, otherwise throws provided error.
   * @param {string} data The string resolvable to resolve
   * @param {Function} [error] The Error constructor to instantiate. Defaults to Error
   * @param {string} [errorMessage] The error message to throw with. Defaults to "Expected string, got <data> instead."
   * @param {boolean} [allowEmpty=true] Whether an empty string should be allowed
   * @returns {string}
   */
  static verifyString(
    data: unknown,
    error: ErrorConstructor = Error,
    errorMessage = `Expected a string, got ${data} instead.`,
    allowEmpty = true,
  ) {
    if (typeof data !== 'string') throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
  }

  /**
   * Can be a number, hex string, a {@link Color}, or an RGB array like:
   * ```js
   * [255, 0, 255] // purple
   * ```
   * @typedef {string|Color|number|number[]} ColorResolvable
   */

  /**
   * Resolves a ColorResolvable into a color number.
   * @param {ColorResolvable} color Color to resolve
   * @returns {number} A color
   */
  static resolveColor(color: unknown) {
    if (typeof color === 'string') {
      if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
      if (color === 'DEFAULT') return 0;
      color = Colors[color as string] ?? parseInt((color as string).replace('#', ''), 16);
    } else if (Array.isArray(color)) {
      color = (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if ((color as number) < 0 || (color as number) > 0xffffff) throw new RangeError('COLOR_RANGE');
    else if (Number.isNaN(color)) throw new TypeError('COLOR_CONVERT');

    return color as number;
  }

  /**
   * Sorts by Discord's position and id.
   * @param {Collection} collection Collection of objects to sort
   * @returns {Collection}
   */
  static discordSort(
    collection: unknown,
  ): import('@discordjs/collection').Collection<string, { id: string; rawPosition: number }> {
    const GuildChannel = require('../structures/GuildChannel');
    const c = collection as {
      first: () => unknown;
      toSorted: (
        fn: (a: unknown, b: unknown) => number,
      ) => import('@discordjs/collection').Collection<string, { id: string; rawPosition: number }>;
    };
    const isGuildChannel = c.first() instanceof GuildChannel;
    return c.toSorted(
      isGuildChannel
        ? (a: unknown, b: unknown) =>
            (a as { rawPosition: number; id: string }).rawPosition -
              (b as { rawPosition: number; id: string }).rawPosition ||
            Number(BigInt((a as { id: string }).id) - BigInt((b as { id: string }).id))
        : (a: unknown, b: unknown) =>
            (a as { rawPosition: number; id: string }).rawPosition -
              (b as { rawPosition: number; id: string }).rawPosition ||
            Number(BigInt((b as { id: string }).id) - BigInt((a as { id: string }).id)),
    );
  }

  /**
   * Sets the position of a Channel or Role.
   * @param {Channel|Role} item Object to set the position of
   * @param {number} position New position for the object
   * @param {boolean} relative Whether `position` is relative to its current position
   * @param {Collection<string, Channel|Role>} sorted A collection of the objects sorted properly
   * @param {APIRouter} route Route to call PATCH on
   * @param {string} [reason] Reason for the change
   * @returns {Promise<Channel[]|Role[]>} Updated item list, with `id` and `position` properties
   * @private
   */
  static async setPosition(
    item: unknown,
    position: number,
    relative: boolean,
    sorted: { values: () => Iterable<unknown> },
    route: { patch: (o: unknown) => Promise<unknown> },
    reason?: string,
  ) {
    let updatedItems = [...sorted.values()];
    Util.moveElementInArray(updatedItems, item, position, relative);
    updatedItems = updatedItems.map((r, i) => ({ id: (r as { id: unknown }).id, position: i }));
    await route.patch({ data: updatedItems, reason });
    return updatedItems;
  }

  /**
   * Alternative to Node's `path.basename`, removing query string after the extension if it exists.
   * @param {string} path Path to get the basename of
   * @param {string} [ext] File extension to remove
   * @returns {string} Basename of the path
   * @private
   */
  static basename(path: unknown, ext?: unknown) {
    const res = parse(path as string);
    return ext && res.ext.startsWith(ext as string) ? res.name : res.base.split('?')[0];
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
        'DeprecationWarning',
      );

      deprecationEmittedForRemoveMentions = true;
    }

    return Util._removeMentions(str);
  }

  static _removeMentions(str: string) {
    return str.replaceAll('@', '@\u200b');
  }

  /**
   * The content to have all mentions replaced by the equivalent text.
   * <warn>When {@link Util.removeMentions} is removed, this method will no longer sanitize mentions.
   * Use {@link BaseMessageOptions#allowedMentions} instead to prevent mentions when sending a message.</warn>
   * @param {string} str The string to be converted
   * @param {TextBasedChannels} channel The channel the string was sent in
   * @returns {string}
   */
  static cleanContent(
    str: string,
    channel: {
      type?: string;
      client: {
        users: { cache: { get: (id: string) => { username: string } | undefined } };
        channels: { cache: { get: (id: string) => { name: string } | undefined } };
      };
      guild: {
        members: { cache: { get: (id: string) => { displayName: string } | undefined } };
        roles: { cache: { get: (id: string) => { name: string } | undefined } };
      } | null;
    },
  ) {
    str = str
      .replace(/<@!?[0-9]+>/g, input => {
        const id = input.replace(/<|!|>|@/g, '');
        if (channel.type === 'DM') {
          const user = channel.client.users.cache.get(id);
          return user ? Util._removeMentions(`@${user.username}`) : input;
        }

        const member = channel.guild?.members.cache.get(id);
        if (member) {
          return Util._removeMentions(`@${member.displayName}`);
        } else {
          const user = channel.client.users.cache.get(id);
          return user ? Util._removeMentions(`@${user.username}`) : input;
        }
      })
      .replace(/<#[0-9]+>/g, input => {
        const mentionedChannel = channel.client.channels.cache.get(input.replace(/<|#|>/g, ''));
        return mentionedChannel ? `#${(mentionedChannel as { name: string }).name}` : input;
      })
      .replace(/<@&[0-9]+>/g, input => {
        if (channel.type === 'DM' || !channel.guild) return input;
        const role = channel.guild.roles.cache.get(input.replace(/<|@|>|&/g, ''));
        return role ? `@${(role as { name: string }).name}` : input;
      });
    return str;
  }

  /**
   * The content to put in a code block with all code block fences replaced by the equivalent backticks.
   * @param {string} text The string to be converted
   * @returns {string}
   */
  static cleanCodeBlockContent(text: string) {
    return text.replaceAll('```', '`\u200b``');
  }

  /**
   * Creates a sweep filter that sweeps archived threads
   * @param {number} [lifetime=14400] How long a thread has to be archived to be valid for sweeping
   * @deprecated When not using with `makeCache` use `Sweepers.archivedThreadSweepFilter` instead
   * @returns {SweepFilter}
   */
  static archivedThreadSweepFilter(lifetime: number = 14400) {
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
        // eslint-disable-next-line max-len
        "The Util.resolveAutoArchiveMaxLimit method and the 'MAX' option are deprecated and will be removed in the next major version.",
        'DeprecationWarning',
      );
      deprecationEmittedForResolveAutoArchiveMaxLimit = true;
    }
    return 10080;
  }

  /**
   * Transforms an API guild forum tag to camel-cased guild forum tag.
   * @param {APIGuildForumTag} tag The tag to transform
   * @returns {GuildForumTag}
   * @ignore
   */
  static transformAPIGuildForumTag(tag: Record<string, unknown>) {
    return {
      id: tag.id,
      name: tag.name,
      moderated: tag.moderated,
      emoji:
        (tag.emoji_id ?? tag.emoji_name)
          ? {
              id: tag.emoji_id,
              name: tag.emoji_name,
            }
          : null,
    };
  }

  /**
   * Transforms a camel-cased guild forum tag to an API guild forum tag.
   * @param {GuildForumTag} tag The tag to transform
   * @returns {APIGuildForumTag}
   * @ignore
   */
  static transformGuildForumTag(tag: Record<string, unknown>) {
    return {
      id: tag.id,
      name: tag.name,
      moderated: tag.moderated,
      emoji_id: (tag.emoji as { id?: unknown } | null)?.id ?? null,
      emoji_name: (tag.emoji as { name?: unknown } | null)?.name ?? null,
    };
  }

  /**
   * Transforms an API guild forum default reaction object to a
   * camel-cased guild forum default reaction object.
   * @param {APIGuildForumDefaultReactionEmoji} defaultReaction The default reaction to transform
   * @returns {DefaultReactionEmoji}
   * @ignore
   */
  static transformAPIGuildDefaultReaction(defaultReaction: Record<string, unknown>) {
    return {
      id: defaultReaction.emoji_id,
      name: defaultReaction.emoji_name,
    };
  }

  /**
   * Transforms a camel-cased guild forum default reaction object to an
   * API guild forum default reaction object.
   * @param {DefaultReactionEmoji} defaultReaction The default reaction to transform
   * @returns {APIGuildForumDefaultReactionEmoji}
   * @ignore
   */
  static transformGuildDefaultReaction(defaultReaction: Record<string, unknown>) {
    return {
      emoji_id: defaultReaction.id,
      emoji_name: defaultReaction.name,
    };
  }

  /**
   * Transforms a guild scheduled event recurrence rule object to a snake-cased variant.
   * @param {GuildScheduledEventRecurrenceRuleOptions} recurrenceRule The recurrence rule to transform
   * @returns {APIGuildScheduledEventRecurrenceRule}
   * @ignore
   */
  static transformGuildScheduledEventRecurrenceRule(recurrenceRule: Record<string, unknown>) {
    return {
      start: new Date(recurrenceRule.startAt as string).toISOString(),
      frequency: recurrenceRule.frequency,
      interval: recurrenceRule.interval,
      by_weekday: recurrenceRule.byWeekday,
      by_n_weekday: recurrenceRule.byNWeekday,
      by_month: recurrenceRule.byMonth,
      by_month_day: recurrenceRule.byMonthDay,
    };
  }

  /**
   * Transforms API incidents data to a camel-cased variant.
   * @param {APIIncidentsData} data The incidents data to transform
   * @returns {IncidentActions}
   * @ignore
   */
  static transformAPIIncidentsData(data: import('discord-api-types/v10').APIIncidentsData) {
    return {
      invitesDisabledUntil: data.invites_disabled_until ? new Date(data.invites_disabled_until) : null,
      dmsDisabledUntil: data.dms_disabled_until ? new Date(data.dms_disabled_until) : null,
      dmSpamDetectedAt: data.dm_spam_detected_at ? new Date(data.dm_spam_detected_at) : null,
      raidDetectedAt: data.raid_detected_at ? new Date(data.raid_detected_at) : null,
    };
  }

  /**
   * Gets an array of the channel types that can be moved in the channel group. For example, a GuildText channel would
   * return an array containing the types that can be ordered within the text channels (always at the top), and a voice
   * channel would return an array containing the types that can be ordered within the voice channels (always at the
   * bottom).
   * @param {ChannelType} type The type of the channel
   * @returns {ChannelType[]}
   * @ignore
   */
  static getSortableGroupTypes(type: unknown) {
    switch (type) {
      case 'GUILD_TEXT':
      case 'GUILD_ANNOUNCEMENT':
      case 'GUILD_FORUM':
        return TextSortableGroupTypes;
      case 'GUILD_VOICE':
      case 'GUILD_STAGE_VOICE':
        return VoiceSortableGroupTypes;
      case 'GUILD_CATEGORY':
        return CategorySortableGroupTypes;
      default:
        return [type];
    }
  }

  /**
   * Calculates the default avatar index for a given user id.
   * @param {Snowflake} userId - The user id to calculate the default avatar index for
   * @returns {number}
   */
  static calculateUserDefaultAvatarIndex(userId: unknown) {
    return Number(BigInt(userId as string | number | bigint) >> 22n) % 6;
  }

  static async getUploadURL(client: unknown, channelId: unknown, files: unknown[]) {
    if (!(files as unknown[]).length) return [];
    files = files.map((file: unknown, i: number) => ({
      filename: (file as { name?: string }).name,
      // 25MB = 26_214_400bytes
      file_size: Math.floor((26_214_400 / 10) * Math.random()),
      id: `${i}`,
    }));
    const c = client as {
      api: { channels: Record<string, { attachments: { post: (o: unknown) => Promise<{ attachments: unknown[] }> } }> };
    };
    const { attachments } = await c.api.channels[String(channelId)].attachments.post({
      data: {
        files,
      },
    });
    return attachments;
  }

  static uploadFile(data: unknown, url: unknown) {
    return new Promise((resolve, reject) => {
      fetch(url as string, {
        method: 'PUT',
        body: data as never,
        duplex: 'half', // Node.js v20
      })
        .then((res: unknown) => {
          const r = res as { ok: boolean };
          if (r.ok) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Lazily evaluates a callback function (yea it's v14 :yay:)
   * @param {Function} cb The callback to lazily evaluate
   * @returns {Function}
   * @example
   * const User = lazy(() => require('./User'));
   * const user = new (User())(client, data);
   */
  static lazy(cb: unknown) {
    let defaultValue: unknown;
    return () => (defaultValue ??= (cb as () => unknown)());
  }

  /**
   * Hacking check object instanceof Proxy-agent
   * @param {Object} object any
   * @returns {boolean}
   */
  static verifyProxyAgent(object: unknown) {
    const o = object as { httpAgent?: unknown; httpsAgent?: unknown };
    return typeof object == 'object' && o.httpAgent instanceof Agent && o.httpsAgent instanceof Agent;
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
    if (typeof data === 'object' && data !== null && typeof (data as { uri?: unknown }).uri === 'string')
      return data as { uri: string };
    return false;
  }

  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs?: number,
    isHandlerDeferUpdate?: boolean,
    parent?: Message | Modal,
  ): Promise<Message | Modal>;
  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs?: number,
    isHandlerDeferUpdate?: boolean,
    parent?: undefined,
  ): Promise<Message>;
  static createPromiseInteraction(
    client: Client,
    nonce: unknown,
    timeoutMs = 5_000,
    isHandlerDeferUpdate = false,
    parent?: Message | Modal,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // Waiting for MsgCreate / ModalCreate
      let dataFromInteractionSuccess: unknown;
      let dataFromNormalEvent: unknown;
      const handler = (data: unknown) => {
        // UnhandledPacket
        const dd = data as { d?: { nonce?: unknown }; t?: string; nonce?: unknown };
        if (isHandlerDeferUpdate && dd.d?.nonce == nonce && dd.t == 'INTERACTION_SUCCESS') {
          // Interaction#deferUpdate
          client.removeListener(Events.MESSAGE_CREATE, handler);
          client.removeListener(Events.UNHANDLED_PACKET, handler);
          client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
          dataFromInteractionSuccess = parent;
        }
        if (dd.nonce !== nonce) return;
        clearTimeout(timeout);
        client.removeListener(Events.MESSAGE_CREATE, handler);
        client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
        if (isHandlerDeferUpdate) client.removeListener(Events.UNHANDLED_PACKET, handler);
        client.decrementMaxListeners();
        dataFromNormalEvent = data;
        resolve(data);
      };
      const timeout = setTimeout(() => {
        if (dataFromInteractionSuccess || dataFromNormalEvent) {
          resolve(dataFromNormalEvent || dataFromInteractionSuccess);
          return;
        }
        client.removeListener(Events.MESSAGE_CREATE, handler);
        client.removeListener(Events.INTERACTION_MODAL_CREATE, handler);
        if (isHandlerDeferUpdate) client.removeListener(Events.UNHANDLED_PACKET, handler);
        client.decrementMaxListeners();
        reject(new DiscordError('INTERACTION_FAILED'));
      }, timeoutMs).unref();
      client.incrementMaxListeners();
      client.on(Events.MESSAGE_CREATE, handler);
      client.on(Events.INTERACTION_MODAL_CREATE, handler);
      if (isHandlerDeferUpdate) client.on(Events.UNHANDLED_PACKET, handler);
    });
  }

  static clearNullOrUndefinedObject(object: unknown) {
    const data: Record<string, unknown> = {};
    const keys = Object.keys(object as Record<string, unknown>);

    for (const key of keys) {
      const value = (object as Record<string, unknown>)[key];
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
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

  /**
   * Get the payload type of the codec
   * @param {'opus' | 'H264' | 'H265' | 'VP8' | 'VP9' | 'AV1'} codecName - Codec name
   * @returns {number}
   */
  static getPayloadType(codecName: unknown) {
    return VoiceCodec.getPayloadType(codecName);
  }

  static getSDPCodecName(portUdpH264: unknown, portUdpH265: unknown, portUdpOpus: unknown) {
    return VoiceCodec.getSDPCodecName(portUdpH264, portUdpH265, portUdpOpus);
  }
}

export default Util;
export { Util };

// Fixes Circular
