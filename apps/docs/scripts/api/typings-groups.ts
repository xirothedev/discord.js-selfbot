export const TYPINGS_GROUPS = [
  { id: 'client', title: 'Client' },
  { id: 'messages', title: 'Messages' },
  { id: 'guilds', title: 'Guilds' },
  { id: 'users', title: 'Users' },
  { id: 'interactions', title: 'Interactions' },
  { id: 'voice', title: 'Voice' },
  { id: 'rest', title: 'REST' },
  { id: 'sharding', title: 'Sharding' },
  { id: 'utilities', title: 'Utilities' },
] as const;

export type TypingsGroupId = (typeof TYPINGS_GROUPS)[number]['id'];

const RULES: Array<{ id: TypingsGroupId; pattern: RegExp }> = [
  { id: 'voice', pattern: /^(Voice|Audio|Recorder|Stream|Play|Video|Receiver|Dispatcher|Connection|UDP)/ },
  { id: 'rest', pattern: /^(REST|Request|RateLimit|API|Route|Handler|HTTP)/ },
  { id: 'sharding', pattern: /^(Shard|Sharding)/ },
  { id: 'interactions', pattern: /^(Interaction|Command|Component|Modal|Button|Select|Autocomplete|Collector)/ },
  { id: 'messages', pattern: /^(Message|Attachment|Embed|Sticker|Poll|Reaction|Typing|WebEmbed|Unfurled)/ },
  {
    id: 'guilds',
    pattern:
      /^(Guild|Role|Permission|Invite|Emoji|Stage|Member|Welcome|Widget|Template|Audit|AutoModeration|Integration|Forum|Thread|Channel|Category|News|Store|Announcement)/,
  },
  { id: 'users', pattern: /^(User|Relationship|Note|Friend|Blocked|ClientUser)/ },
  {
    id: 'client',
    pattern:
      /^(Client|BaseClient|Webhook|Presence|Activity|Status|Session|Auth|RemoteAuth|QR|Sweeper|Application|Intents|Constants|Formatters|Events|Partials)/,
  },
];

export function typingsGroupFor(name: string): TypingsGroupId {
  return RULES.find(rule => rule.pattern.test(name))?.id ?? 'utilities';
}
