import { expect, test } from 'bun:test';
import GatewayDispatch from '../src/client/websocket/GatewayDispatch';
import _ConstantsModule from '../src/util/Constants';

const { Events, Status } = _ConstantsModule;

const packetDataKey = 'd';
const packetTypeKey = 't';

function packet(type: string, data: unknown) {
  return { [packetDataKey]: data, [packetTypeKey]: type };
}

function createClient(status = Status.READY) {
  const emitted: { event: string; args: unknown[] }[] = [];
  const client = {
    emit: (event: string, ...args: unknown[]) => {
      emitted.push({ args, event });
      return false;
    },
    ws: { status },
  } as unknown as ConstructorParameters<typeof GatewayDispatch>[0];
  return { client, emitted };
}

test('GatewayDispatch dispatches registered action handlers by event type', () => {
  const { client, emitted } = createClient(Status.READY);
  let handled: unknown = null;
  const actions = {
    MessageCreate: {
      handle: (data: unknown, shard: unknown) => {
        handled = { data, shard };
        return { ok: true };
      },
    },
  } as unknown as Parameters<GatewayDispatch['registerDefaults']>[0];

  const dispatch = new GatewayDispatch(client);
  dispatch.registerDefaults(actions);

  const result = dispatch.handle(packet('MESSAGE_CREATE', { id: '1' }), {
    id: 0,
  } as unknown as Parameters<GatewayDispatch['handle']>[1]);

  expect(result).toBe(true);
  expect(handled).toEqual({ data: { id: '1' }, shard: { id: 0 } });
  expect(emitted).toHaveLength(0);
});

test('GatewayDispatch emits UNHANDLED_PACKET for unknown events', () => {
  const { client, emitted } = createClient(Status.READY);
  const dispatch = new GatewayDispatch(client);
  dispatch.registerDefaults(
    {} as unknown as Parameters<GatewayDispatch['registerDefaults']>[0]
  );

  const unknownPacket = packet('NOT_A_REAL_EVENT', { value: 1 });
  dispatch.handle(unknownPacket);

  expect(emitted).toHaveLength(1);
  expect(emitted[0]?.event).toBe(Events.UNHANDLED_PACKET);
  expect(emitted[0]?.args[0]).toBe(unknownPacket);
});

test('GatewayDispatch queues non-whitelisted packets before READY', () => {
  const state = createClient(Status.CONNECTING);
  let calls = 0;
  const actions = {
    MessageCreate: {
      handle: () => {
        calls += 1;
      },
    },
  } as unknown as Parameters<GatewayDispatch['registerDefaults']>[0];
  const dispatch = new GatewayDispatch(state.client);
  dispatch.registerDefaults(actions);

  const queued = dispatch.handle(packet('MESSAGE_CREATE', { id: '1' }));
  expect(queued).toBe(false);
  expect(calls).toBe(0);
});
