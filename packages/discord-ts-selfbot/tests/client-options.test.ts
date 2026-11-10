import { expect, test } from 'bun:test';

import { Client, Intents } from '../src/index';

test('Client options default to a single shard and full intents', () => {
  const client = new Client();

  try {
    expect(client.options.shardCount).toBe(1);
    expect(client.options.shards).toEqual([0]);
    expect(client.options.intents).toBe(Intents.ALL);
  } finally {
    client.destroy();
  }
});

test('Client options honor an explicit shardCount', () => {
  const client = new Client({ shardCount: 3 });

  try {
    expect(client.options.shardCount).toBe(3);
    expect(client.options.shards).toEqual([0, 1, 2]);
  } finally {
    client.destroy();
  }
});

test('Client options honor explicit shard IDs', () => {
  const client = new Client({ shards: [0, 2] });

  try {
    expect(client.options.shards).toEqual([0, 2]);
    expect(client.options.shardCount).toBe(2);
  } finally {
    client.destroy();
  }
});

test('Client options accept a single shard ID', () => {
  const client = new Client({ shards: 1 });

  try {
    expect(client.options.shards).toEqual([1]);
    expect(client.options.shardCount).toBe(1);
  } finally {
    client.destroy();
  }
});

test('Client options keep an explicit shardCount alongside explicit shard IDs', () => {
  const client = new Client({ shardCount: 3, shards: [0, 2] });

  try {
    expect(client.options.shardCount).toBe(3);
    expect(client.options.shards).toEqual([0, 2]);
  } finally {
    client.destroy();
  }
});

test('Client options keep auto shard resolution for gateway connect', () => {
  const client = new Client({ shards: 'auto' });

  try {
    expect(client.options.shards).toBe('auto');
    expect(client.ws.totalShards).toBe(1);
  } finally {
    client.destroy();
  }
});

test('Client options accept intents for type parity but ignore them', () => {
  const client = new Client({ intents: Intents.FLAGS.GUILDS });

  try {
    expect(client.options.intents).toBe(Intents.ALL);
  } finally {
    client.destroy();
  }
});

test('Client options reject invalid shard settings', () => {
  expect(() => new Client({ shardCount: 0 })).toThrow();
  expect(() => new Client({ shardCount: 1.5 })).toThrow();
  expect(() => new Client({ shards: [] })).toThrow();
  expect(() => new Client({ shards: 'invalid' })).toThrow();
});
