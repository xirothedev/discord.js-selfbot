function longestCommonPrefix(
  before: readonly string[],
  after: readonly string[]
): number {
  let count = 0;
  while (
    count < before.length &&
    count < after.length &&
    before[count] === after[count]
  ) {
    count += 1;
  }
  return count;
}

function longestCommonSuffix(
  before: readonly string[],
  after: readonly string[],
  start: number
): number {
  let count = 0;
  while (
    count < before.length - start &&
    count < after.length - start &&
    before[before.length - 1 - count] === after[after.length - 1 - count]
  ) {
    count += 1;
  }
  return count;
}

export function unifiedDiff(
  filePath: string,
  before: string,
  after: string
): string {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const common = longestCommonPrefix(beforeLines, afterLines);
  const commonEnd = longestCommonSuffix(beforeLines, afterLines, common);
  const removed = beforeLines.slice(common, beforeLines.length - commonEnd);
  const added = afterLines.slice(common, afterLines.length - commonEnd);
  const lines: string[] = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -${common + 1} +${common + 1} @@`,
  ];
  for (const line of removed) {
    lines.push(`-${line}`);
  }
  for (const line of added) {
    lines.push(`+${line}`);
  }
  return lines.join('\n');
}
