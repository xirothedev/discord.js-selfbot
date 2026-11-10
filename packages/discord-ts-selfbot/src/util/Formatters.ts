import {
  blockQuote,
  bold,
  channelMention,
  codeBlock,
  formatEmoji,
  hideLinkEmbed,
  hyperlink,
  inlineCode,
  italic,
  quote,
  roleMention,
  spoiler,
  strikethrough,
  time,
  TimestampStyles,
  underscore,
  userMention,
} from '@discordjs/builders';

const Formatters: Record<string, unknown> =
  class extends null {} as unknown as Record<string, unknown>;

Formatters.blockQuote = blockQuote;

Formatters.bold = bold;

Formatters.channelMention = channelMention;

Formatters.chatInputApplicationCommandMention =
  function chatInputApplicationCommandMention(
    commandName: string,
    subcommandGroupOrSubOrId: string,
    subcommandNameOrId?: string,
    commandId?: string
  ) {
    if (commandId !== undefined) {
      return `</${commandName} ${subcommandGroupOrSubOrId} ${subcommandNameOrId}:${commandId}>`;
    }

    if (subcommandNameOrId !== undefined) {
      return `</${commandName} ${subcommandGroupOrSubOrId}:${subcommandNameOrId}>`;
    }

    return `</${commandName}:${subcommandGroupOrSubOrId}>`;
  };

Formatters.codeBlock = codeBlock;

Formatters.formatEmoji = formatEmoji;

Formatters.hideLinkEmbed = hideLinkEmbed;

Formatters.hyperlink = hyperlink;

Formatters.inlineCode = inlineCode;

Formatters.italic = italic;

Formatters.quote = quote;

Formatters.roleMention = roleMention;

Formatters.spoiler = spoiler;

Formatters.strikethrough = strikethrough;

Formatters.time = time;

Formatters.TimestampStyles = TimestampStyles;

Formatters.underscore = underscore;

Formatters.userMention = userMention;

export default Formatters;
export { Formatters };
