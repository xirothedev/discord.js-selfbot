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

function buildRoute(manager: any): any {
  const route: string[] = [''];
  const handler = {
    get(_target: any, name: string | symbol) {
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
        return (options: any) =>
          manager.request(
            name,
            route.join('/'),
            Object.assign(
              {
                versioned: manager.versioned,
                route: routeBucket.join('/'),
              },
              options,
            ),
          );
      }
      route.push(name as string);
      return new Proxy(noop, handler);
    },
    apply(_target: any, _thisArg: any, args: any[]) {
      route.push(...args.filter(x => x != null)); // eslint-disable-line eqeqeq
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler);
}

export default buildRoute;
export { buildRoute };
