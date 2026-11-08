import { describe, expect, test } from 'bun:test';
import { escapeMdx } from './comment';
import { mergeSignature, signatureLine } from './render-shared';
import { renderType } from './render-type';

describe('renderType', () => {
  test('renders intrinsic, union, array, and reference types', () => {
    expect(renderType({ type: 'intrinsic', name: 'string' })).toBe('string');
    expect(
      renderType({
        type: 'union',
        types: [
          { type: 'intrinsic', name: 'string' },
          { type: 'intrinsic', name: 'number' },
        ],
      }),
    ).toBe('string | number');
    expect(
      renderType({
        type: 'array',
        elementType: {
          type: 'union',
          types: [
            { type: 'intrinsic', name: 'string' },
            { type: 'intrinsic', name: 'number' },
          ],
        },
      }),
    ).toBe('(string | number)[]');
    expect(
      renderType({
        type: 'reference',
        name: 'Promise',
        typeArguments: [{ type: 'intrinsic', name: 'string' }],
      }),
    ).toBe('Promise<string>');
  });
});

describe('mergeSignature', () => {
  test('prefers source descriptions and typings types', () => {
    const merged = mergeSignature(
      {
        name: 'login',
        parameters: [
          {
            name: 'token',
            type: { type: 'intrinsic', name: 'any' },
            flags: { isOptional: true },
            comment: { summary: [{ kind: 'text', text: 'Token of the account to log in with' }] },
          },
        ],
        type: { type: 'intrinsic', name: 'any' },
      },
      {
        name: 'login',
        parameters: [{ name: 'token', type: { type: 'intrinsic', name: 'string' }, flags: { isOptional: true } }],
        type: {
          type: 'reference',
          name: 'Promise',
          typeArguments: [{ type: 'intrinsic', name: 'string' }],
        },
      },
    );

    expect(merged.parameters[0]?.type).toEqual({ type: 'intrinsic', name: 'string' });
    expect(merged.parameters[0]?.comment?.summary?.[0]?.text).toBe('Token of the account to log in with');
    expect(signatureLine(merged, 'login')).toBe('login(token?: string): Promise<string>');
  });
});

describe('escapeMdx', () => {
  test('escapes JSX-significant characters in prose', () => {
    expect(escapeMdx('Promise<string> { value }')).toBe('Promise\\<string\\> \\{ value \\}');
  });
});
