import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { Api, BenchCase, CaseResult, RunResult, Stats } from "./types";

let sink = 0;

export function consume(value: unknown): void {
  if (typeof value === "number") {
    sink += value;
  } else if (typeof value === "string") {
    sink += value.length;
  } else if (value instanceof Uint8Array) {
    sink += value.byteLength;
  } else if (value instanceof ArrayBuffer) {
    sink += value.byteLength;
  } else if (Array.isArray(value)) {
    sink += value.length;
  } else if (value && typeof value === "object" && "byteLength" in value) {
    sink += Number((value as { byteLength: number }).byteLength);
  }
  if (!Number.isFinite(sink)) {
    throw new TypeError("benchmark sink is not finite");
  }
}

function stats(samples: number[], bytes: number | null): Stats {
  const sorted = [...samples].toSorted((left, right) => left - right);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 =
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
  const [min] = sorted;
  const opsPerSecond = 1000 / median;
  return {
    medianMs: median,
    mibPerSecond: bytes === null ? null : (bytes / 1024 / 1024) * opsPerSecond,
    minMs: min,
    opsPerSecond,
    p95Ms: p95,
  };
}

export async function runCase(
  benchCase: BenchCase,
  rounds: number
): Promise<CaseResult> {
  const warmup = Math.max(
    1,
    Math.min(50, Math.floor(benchCase.iterations / 10))
  );
  await Array.fromAsync({ length: warmup }, async () => {
    consume(await benchCase.node());
    consume(await benchCase.bun());
  });

  const nodeSamples: number[] = [];
  const bunSamples: number[] = [];
  await Array.fromAsync({ length: rounds }, async (_value, round) => {
    const order: Api[] = round % 2 === 0 ? ["node", "bun"] : ["bun", "node"];
    await Array.fromAsync(order, async (api) => {
      const samples = api === "node" ? nodeSamples : bunSamples;
      const start = Bun.nanoseconds();
      await Array.fromAsync({ length: benchCase.iterations }, async () => {
        consume(await benchCase[api]());
      });
      samples.push((Bun.nanoseconds() - start) / 1e6 / benchCase.iterations);
    });
  });

  const bytes = benchCase.bytes ?? null;
  const node = stats(nodeSamples, bytes);
  const bun = stats(bunSamples, bytes);
  return {
    bun,
    bytes,
    group: benchCase.group,
    id: benchCase.id,
    iterations: benchCase.iterations,
    label: benchCase.label,
    node,
    ratio: bun.opsPerSecond / node.opsPerSecond,
  };
}

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function perSecond(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return number.format(value);
}

function ratio(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function printTable(results: CaseResult[]): void {
  console.log("");
  console.log(
    [
      "Case".padEnd(26),
      "Node API".padStart(11),
      "Bun API".padStart(11),
      "Bun/Node".padStart(9),
      "Node p95".padStart(11),
      "Bun p95".padStart(11),
    ].join(" ")
  );
  let group = "";
  for (const result of results) {
    const { group: resultGroup } = result;
    if (resultGroup !== group) {
      group = resultGroup;
      console.log(`\n[${group}]`);
    }
    console.log(
      [
        result.id.padEnd(26),
        `${perSecond(result.node.opsPerSecond)}/s`.padStart(11),
        `${perSecond(result.bun.opsPerSecond)}/s`.padStart(11),
        ratio(result.ratio).padStart(9),
        `${result.node.p95Ms.toFixed(3)}ms`.padStart(11),
        `${result.bun.p95Ms.toFixed(3)}ms`.padStart(11),
      ].join(" ")
    );
  }
  console.log("");
}

export function toMarkdown(run: RunResult): string {
  const { meta, results } = run;
  const faster = results.filter((result) => result.ratio >= 1.05);
  const slower = results.filter((result) => result.ratio <= 0.95);
  const neutral = results.length - faster.length - slower.length;
  const lines = [
    "# Node API vs Bun API benchmark",
    "",
    `- Runtime: Bun ${meta.bunVersion} (${meta.bunRevision})`,
    `- Platform: ${meta.platform} ${meta.arch}`,
    `- Date: ${meta.date}`,
    `- Rounds: ${meta.rounds}`,
    `- Filter: ${meta.filters.length ? meta.filters.join(", ") : "all"}`,
    "",
    "The ratio is Bun API throughput divided by Node API throughput. `1.00x`",
    "means no difference. A value below `1.00x` means the Bun API was slower.",
    "",
    "| Group | Case | Node API | Bun API | Bun/Node | Node p95 | Bun p95 |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const result of results) {
    lines.push(
      `| ${result.group} | ${result.id} | ${perSecond(result.node.opsPerSecond)}/s | ${perSecond(
        result.bun.opsPerSecond
      )}/s | ${ratio(result.ratio)} | ${result.node.p95Ms.toFixed(3)} ms | ${result.bun.p95Ms.toFixed(3)} ms |`
    );
  }

  lines.push(
    "",
    "## Summary",
    "",
    `- Bun faster (at least 1.05x): ${faster.length}`,
    `- Node faster (at most 0.95x): ${slower.length}`,
    `- Neutral: ${neutral}`
  );
  if (faster.length) {
    lines.push(
      `- Fastest Bun win: ${faster.toSorted((left, right) => right.ratio - left.ratio)[0].id}`
    );
  }
  if (slower.length) {
    lines.push(
      `- Largest Bun loss: ${slower.toSorted((left, right) => left.ratio - right.ratio)[0].id}`
    );
  }
  lines.push("");
  return lines.join("\n");
}

export async function writeOutputs(
  run: RunResult,
  jsonPath?: string,
  markdownPath?: string
): Promise<void> {
  if (jsonPath) {
    await mkdir(path.dirname(jsonPath), { recursive: true });
    await Bun.write(jsonPath, `${JSON.stringify(run, null, 2)}\n`);
  }
  if (markdownPath) {
    await mkdir(path.dirname(markdownPath), { recursive: true });
    await Bun.write(markdownPath, toMarkdown(run));
  }
}
