import type { MessageComponentType } from '../../typings';
import _ConstantsModule from '../util/Constants';

const { MessageComponentTypes } = _ConstantsModule;

export interface ComponentDataSource {
  id?: number;
  type?: string | number;
  [key: string]: unknown;
}

export function isComponentDataSource(
  value: unknown
): value is ComponentDataSource {
  return typeof value === 'object' && value !== null;
}

export function readComponentString(
  data: ComponentDataSource,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

export function readComponentNumber(
  data: ComponentDataSource,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number') {
      return value;
    }
  }
  return undefined;
}

export function readComponentBoolean(
  data: ComponentDataSource,
  ...keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

export function readComponentArray(
  data: ComponentDataSource,
  key: string
): unknown[] {
  const value = data[key];
  return Array.isArray(value) ? value : [];
}

export function readComponentRecord(
  data: ComponentDataSource,
  key: string
): ComponentDataSource | undefined {
  const value = data[key];
  return isComponentDataSource(value) ? value : undefined;
}

export function isMessageComponentType(
  value: unknown
): value is MessageComponentType {
  return typeof value === 'string' && value in MessageComponentTypes;
}
