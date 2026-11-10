import { describe, expect, test } from 'bun:test';

import { escapeMdx } from './comment';
import { mergeSignature, signatureLine } from './render-shared';
import { renderType } from './render-type';

describe('renderType', () => {
  test('renders intrinsic, union, array, and reference types', () => {
    expect(renderType({ name: 'string', type: 'intrinsic' })).toBe('string');
    expect(
      renderType({
        type: 'union',
        types: [
          { name: 'string', type: 'intrinsic' },
          { name: 'number', type: 'intrinsic' },
        ],
      })
    ).toBe('string | number');
    expect(
      renderType({
        elementType: {
          type: 'union',
          types: [
            { name: 'string', type: 'intrinsic' },
            { name: 'number', type: 'intrinsic' },
          ],
        },
        type: 'array',
      })
    ).toBe('(string | number)[]');
    expect(
      renderType({
        name: 'Promise',
        type: 'reference',
        typeArguments: [{ name: 'string', type: 'intrinsic' }],
      })
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
            comment: {
              summary: [
                { kind: 'text', text: 'Token of the account to log in with' },
              ],
            },
            flags: { isOptional: true },
            name: 'token',
            type: { name: 'any', type: 'intrinsic' },
          },
        ],
        type: { name: 'any', type: 'intrinsic' },
      },
      {
        name: 'login',
        parameters: [
          {
            flags: { isOptional: true },
            name: 'token',
            type: { name: 'string', type: 'intrinsic' },
          },
        ],
        type: {
          name: 'Promise',
          type: 'reference',
          typeArguments: [{ name: 'string', type: 'intrinsic' }],
        },
      }
    );

    expect(merged.parameters[0]?.type).toEqual({
      name: 'string',
      type: 'intrinsic',
    });
    expect(merged.parameters[0]?.comment?.summary?.[0]?.text).toBe(
      'Token of the account to log in with'
    );
    expect(signatureLine(merged, 'login')).toBe(
      'login(token?: string): Promise<string>'
    );
  });
});

describe('escapeMdx', () => {
  test('escapes JSX-significant characters in prose', () => {
    expect(escapeMdx('Promise<string> { value }')).toBe(
      'Promise\\<string\\> \\{ value \\}'
    );
  });
});
