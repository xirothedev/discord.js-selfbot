import { expect, test } from 'bun:test';

import { Util } from '../src/index';

test('escapeMaskedLink escapes masked links', () => {
  expect(Util.escapeMaskedLink('[hello](https://example.com)')).toBe(
    '\\[hello](https://example.com)'
  );
  expect(Util.escapeMaskedLink('before [link](url) after')).toBe(
    'before \\[link](url) after'
  );
  expect(Util.escapeMaskedLink('no links here')).toBe('no links here');
});

test('escapeMaskedLink does not backtrack on adversarial input', () => {
  // These strings previously took seconds each (polynomial ReDoS).
  const repeatedBrackets = '[a'.repeat(100_000);
  const repeatedLinks = `[a](${'a]('.repeat(100_000)})`;

  expect(Util.escapeMaskedLink(repeatedBrackets)).toBe(repeatedBrackets);
  expect(Util.escapeMaskedLink(repeatedLinks)).toBe(`\\${repeatedLinks}`);

  // Alert 2: the groups used to be able to consume the "\\[" prefix, so each
  // start position rescanned the remainder of the string.
  const repeatedEscapes = '[a'.repeat(100_000);
  const repeatedPrefixes = `[\\](${'[(\\](('.repeat(100_000)}`;
  expect(Util.escapeMaskedLink(repeatedEscapes)).toBe(repeatedEscapes);
  expect(Util.escapeMaskedLink(repeatedPrefixes)).toBe(repeatedPrefixes);
});
