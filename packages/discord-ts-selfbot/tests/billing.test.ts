import { afterAll, beforeAll, expect, test } from "bun:test";

import { startFakeDiscord } from "@discord-ts-selfbot/test-harness";

import { Client } from "../src/index";

const PAYMENT_SOURCES = [
  {
    billing_address: {
      city: "San Francisco",
      country: "US",
      line_1: "123 Main Street",
      line_2: null,
      name: "Test User",
      postal_code: "94105",
      state: "CA",
    },
    brand: "visa",
    country: "US",
    default: true,
    deleted_at: null,
    expires_month: 9,
    expires_year: 2077,
    flags: 0,
    id: "900000000000000101",
    invalid: false,
    last_4: "4242",
    payment_gateway: 1,
    type: 1,
  },
];

const SUBSCRIPTIONS = [
  {
    canceled_at: null,
    country_code: "US",
    created_at: "2026-11-01T00:00:00.000Z",
    currency: "usd",
    current_period_end: "2026-12-01T00:00:00.000Z",
    current_period_start: "2026-11-01T00:00:00.000Z",
    id: "900000000000000201",
    items: [
      { id: "900000000000000202", plan_id: "900000000000000203", quantity: 1 },
    ],
    payment_gateway: 1,
    payment_gateway_plan_id: "plan_nitro",
    payment_source_id: "900000000000000101",
    status: 1,
    type: 1,
  },
];

const GUILD_BOOST_SLOTS = [
  {
    canceled: false,
    cooldown_ends_at: "2026-11-10T00:00:00.000Z",
    id: "900000000000000301",
    premium_guild_subscription: {
      ended: false,
      guild_id: "900000000000000304",
      id: "900000000000000303",
    },
    subscription_id: "900000000000000302",
  },
];

const fake = startFakeDiscord({
  apiResponses: {
    "GET /v9/users/@me/billing/payment-sources": PAYMENT_SOURCES,
    "GET /v9/users/@me/billing/subscriptions": SUBSCRIPTIONS,
    "GET /v9/users/@me/guilds/premium/subscription-slots": GUILD_BOOST_SLOTS,
  },
});
const client = new Client({ http: { api: fake.url, version: 9 } });

beforeAll(async () => {
  await client.login("fake-token");
});

afterAll(() => {
  client.destroy();
  fake.stop();
});

test("BillingManager#fetchPaymentSources GETs the payment sources route and caches them by id", async () => {
  expect(client.billing.paymentSources.size).toBe(0);

  const result = await client.billing.fetchPaymentSources();

  const req = fake.getLastRequest();
  expect(req.method).toBe("GET");
  expect(req.path).toBe("/v9/users/@me/billing/payment-sources");
  expect(result).toBe(client.billing.paymentSources);
  expect(result.size).toBe(PAYMENT_SOURCES.length);
  expect(result.get(PAYMENT_SOURCES[0].id)).toEqual(PAYMENT_SOURCES[0]);
});

test("BillingManager#fetchCurrentSubscription GETs the subscriptions route and caches them by id", async () => {
  expect(client.billing.currentSubscription.size).toBe(0);

  const result = await client.billing.fetchCurrentSubscription();

  const req = fake.getLastRequest();
  expect(req.method).toBe("GET");
  expect(req.path).toBe("/v9/users/@me/billing/subscriptions");
  expect(result).toBe(client.billing.currentSubscription);
  expect(result.size).toBe(SUBSCRIPTIONS.length);
  expect(result.get(SUBSCRIPTIONS[0].id)).toEqual(SUBSCRIPTIONS[0]);
});

test("BillingManager#fetchGuildBoosts GETs the slot route and parses GuildBoost instances", async () => {
  expect(client.billing.guildBoosts.size).toBe(0);

  const result = await client.billing.fetchGuildBoosts();

  const req = fake.getLastRequest();
  expect(req.method).toBe("GET");
  expect(req.path).toBe("/v9/users/@me/guilds/premium/subscription-slots");
  expect(result).toBe(client.billing.guildBoosts);
  expect(result.size).toBe(GUILD_BOOST_SLOTS.length);

  const [slot] = GUILD_BOOST_SLOTS;
  const boost = result.get(slot.id);
  expect(boost.constructor.name).toBe("GuildBoost");
  expect(boost.id).toBe(slot.id);
  expect(boost.subscriptionId).toBe(slot.subscription_id);
  expect(boost.canceled).toBe(slot.canceled);
  expect(boost.cooldownEndsAt).toEqual(new Date(slot.cooldown_ends_at));
  expect(boost.premiumGuildSubscriptionId).toBe(
    slot.premium_guild_subscription.id
  );
  expect(boost.guildId).toBe(slot.premium_guild_subscription.guild_id);
  expect(boost.ended).toBe(slot.premium_guild_subscription.ended);
});
