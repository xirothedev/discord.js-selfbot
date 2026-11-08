import { impl } from './lib/impl';

export function greet(name: string): string {
  return impl(name);
}
