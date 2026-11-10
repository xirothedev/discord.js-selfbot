const noop = () => {}; // eslint-disable-line no-empty-function
const methods = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors: (string | symbol)[] = [
  'toString',
  'valueOf',
  'inspect',
  'constructor',
  Symbol.toPrimitive,
  Symbol.for('nodejs.util.inspect.custom'),
];

export type ApiRouter = ((options?: unknown) => ApiRouter) & {
  [key: string]: ApiRouter;
} & {
  get(options?: unknown): Promise<unknown>;
  post(options?: unknown): Promise<unknown>;
  delete(options?: unknown): Promise<unknown>;
  patch(options?: unknown): Promise<unknown>;
  put(options?: unknown): Promise<unknown>;
};

function buildRoute(manager: {
  request: (name: string, route: string, options?: Record<string, unknown>) => unknown;
  versioned: boolean;
}): ApiRouter {
  const route: string[] = [''];
  const handler = {
    get(_target: unknown, name: string | symbol) {
      if (reflectors.includes(name)) return () => route.join('/');
      if (methods.includes(name as string)) {
        const routeBucket: string[] = [];
        for (let i = 0; i < route.length; i++) {
          // Reactions routes and sub-routes all share the same bucket
          if (route[i - 1] === 'reactions') break;
          // Literal ids should only be taken account if they are the Major id (the Channel/Guild id)
          if (/\d{16,19}/g.test(route[i]) && !/channels|guilds/.test(route[i - 1])) routeBucket.push(':id');
          // All other parts of the route should be considered as part of the bucket identifier
          else routeBucket.push(route[i]);
        }
        return (options?: unknown) =>
          manager.request(
            name as string,
            route.join('/'),
            Object.assign(
              {
                versioned: manager.versioned,
                route: routeBucket.join('/'),
              },
              (options ?? {}) as Record<string, unknown>,
            ),
          );
      }
      route.push(name as string);
      return new Proxy(noop, handler);
    },
    apply(_target: unknown, _thisArg: unknown, args: unknown[]) {
      route.push(...(args.filter(x => x != null) as string[])); // eslint-disable-line eqeqeq
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler) as unknown as ApiRouter;
}

export default buildRoute;
export { buildRoute };
