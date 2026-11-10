const noop = () => null;
const methods = ["get", "post", "delete", "patch", "put"];
const reflectors: (string | symbol)[] = [
  "toString",
  "valueOf",
  "inspect",
  "constructor",
  Symbol.toPrimitive,
  Symbol.for("nodejs.util.inspect.custom"),
];

export type ApiRouter = ((...args: unknown[]) => ApiRouter) & {
  [key: string]: ApiRouter;
} & {
  get: <Result = unknown>(options?: unknown) => Promise<Result>;
  post: <Result = unknown>(options?: unknown) => Promise<Result>;
  delete: <Result = unknown>(options?: unknown) => Promise<Result>;
  patch: <Result = unknown>(options?: unknown) => Promise<Result>;
  put: <Result = unknown>(options?: unknown) => Promise<Result>;
};

function buildRoute(manager: {
  request: (
    name: string,
    route: string,
    options?: Record<string, unknown>
  ) => unknown;
  versioned: boolean;
}): ApiRouter {
  const route: string[] = [""];
  const handler = {
    apply(_target: unknown, _thisArg: unknown, args: unknown[]) {
      route.push(
        ...(args.filter(
          (value) => value !== null && value !== undefined
        ) as string[])
      );
      return new Proxy(noop, handler);
    },
    get(_target: unknown, name: string | symbol) {
      if (reflectors.includes(name)) {
        return () => route.join("/");
      }
      if (methods.includes(name as string)) {
        const routeBucket: string[] = [];
        for (let index = 0; index < route.length; index++) {
          // Reactions routes and sub-routes all share the same bucket
          if (route[index - 1] === "reactions") {
            break;
          }
          // Literal ids should only be taken account if they are the Major id (the Channel/Guild id)
          if (
            /\d{16,19}/u.test(route[index]) &&
            !/channels|guilds/u.test(route[index - 1])
          ) {
            routeBucket.push(":id");
          } else {
            // All other parts of the route should be considered as part of the bucket identifier
            routeBucket.push(route[index]);
          }
        }
        return (options?: unknown) =>
          manager.request(
            name as string,
            route.join("/"),
            Object.assign(
              {
                route: routeBucket.join("/"),
                versioned: manager.versioned,
              },
              (options ?? {}) as Record<string, unknown>
            )
          );
      }
      route.push(name as string);
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler) as unknown as ApiRouter;
}

export default buildRoute;
export { buildRoute };
