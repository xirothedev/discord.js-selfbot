export interface ConvertedPage {
  title: string;
  description?: string;
  body: string;
}

export interface ConvertOptions {
  include?: (file: string) => string | undefined;
}

function decodeEntities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&");
}

function attribute(attributes: string, name: string): string | undefined {
  const match = attributes.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, "u")
  );
  if (!match) {
    return undefined;
  }
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? "");
}

function dedent(text: string): string {
  const lines = text.replaceAll(/^\n+|\n+$/gu, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/u)?.[0].length ?? 0);
  const width = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(width)).join("\n");
}

const CALLOUT_LABELS: Record<string, string> = {
  error: "Error",
  warn: "Warning",
};

function renderCallouts(body: string): string {
  return body.replaceAll(
    /<Callout\b(?<attributes>[^>]*)>(?<inner>[\s\S]*?)<\/Callout>/gu,
    (_match, attributes: string, inner: string) => {
      const title = attribute(attributes, "title");
      const type = attribute(attributes, "type") ?? "note";
      const label = title ?? CALLOUT_LABELS[type] ?? "Note";
      const text = dedent(inner).trim();
      const quoted = text
        .split("\n")
        .map((line) => (line.length ? `> ${line}` : ">"))
        .join("\n");
      return `> **${label}**\n>\n${quoted}`;
    }
  );
}

function renderCards(body: string): string {
  return body.replaceAll(
    /<Cards\b[^>]*>(?<inner>[\s\S]*?)<\/Cards>/gu,
    (_match, inner: string) => {
      const cards = [
        ...inner.matchAll(
          /<Card\b(?<attributes>[^>]*?)(?:\/>|>(?<inner>[\s\S]*?)<\/Card>)/gu
        ),
      ];
      return cards
        .map((card) => {
          const attributes = card[1] ?? "";
          const title = attribute(attributes, "title") ?? "Reference";
          const href = attribute(attributes, "href");
          const description = attribute(attributes, "description");
          const label = href ? `[${title}](${href})` : title;
          return `- ${label}${description ? ` — ${description}` : ""}`;
        })
        .join("\n");
    }
  );
}

function renderTabs(body: string): string {
  return body
    .replaceAll(/<Tabs\b[^>]*>/gu, "")
    .replaceAll("</Tabs>", "")
    .replaceAll(
      /<Tab\b(?<attributes>[^>]*)>/gu,
      (_match, attributes: string) => {
        const value =
          attribute(attributes, "value") ?? attribute(attributes, "title");
        return value ? `### ${value}\n` : "";
      }
    )
    .replaceAll("</Tab>", "");
}

function renderIncludes(
  body: string,
  include: ConvertOptions["include"]
): string {
  if (!include) {
    return body;
  }
  return body.replaceAll(
    /^[ \t]*<include\b(?<attributes>[^>]*)>(?<inner>[\s\S]*?)<\/include>/gmu,
    (_match, attributes: string, inner: string) => {
      const lang = attribute(attributes, "lang") ?? "ts";
      const code =
        include(inner.trim()) ?? `// Missing include: ${inner.trim()}`;
      const fence = lang === "ts" ? "ts check" : lang;
      return `\`\`\`${fence}\n${code.trimEnd()}\n\`\`\``;
    }
  );
}

function dedentFences(body: string): string {
  const output: string[] = [];
  let fenceIndent: number | undefined;

  for (const line of body.split("\n")) {
    const fence = line.match(/^(?<indent>\s*)```/u);
    if (fence) {
      if (fenceIndent === undefined) {
        fenceIndent = fence[1].length;
        output.push(line.slice(fenceIndent));
        continue;
      }
      if (fence[1].length >= fenceIndent) {
        output.push(line.slice(fenceIndent));
        fenceIndent = undefined;
        continue;
      }
    }

    const leading = line.match(/^\s*/u)?.[0].length ?? 0;
    output.push(
      fenceIndent === undefined
        ? line
        : line.slice(Math.min(fenceIndent, leading))
    );
  }

  return output.join("\n");
}

function stripRemainingComponents(body: string): string {
  return body
    .replaceAll(/<br\s*\/?>/gu, "\n")
    .replaceAll(/<\/?(?:Callout|Cards|Card|Tabs|Tab|include)\b[^>]*\/?>/gu, "")
    .replaceAll(/\{\/\*[\s\S]*?\*\/\}/gu, "");
}

export function convertMdx(
  source: string,
  options: ConvertOptions = {}
): ConvertedPage {
  const frontmatter = source.match(/^---\n(?<meta>[\s\S]*?)\n---\n?/u);
  const metadata = new Map<string, string>();
  let body = source;

  if (frontmatter) {
    body = source.slice(frontmatter[0].length);
    for (const line of frontmatter[1].split("\n")) {
      const match = line.match(/^(?<key>[A-Za-z0-9_-]+):\s*(?<value>.*)$/u);
      if (!match) {
        continue;
      }
      metadata.set(match[1], match[2].replaceAll(/^['"]|['"]$/gu, ""));
    }
  }

  body = renderIncludes(body, options.include);
  body = renderCallouts(body);
  body = renderCards(body);
  body = renderTabs(body);
  body = stripRemainingComponents(body);
  body = dedentFences(decodeEntities(body)).trim();

  return {
    body,
    description: metadata.get("description"),
    title: metadata.get("title") ?? "Untitled",
  };
}
