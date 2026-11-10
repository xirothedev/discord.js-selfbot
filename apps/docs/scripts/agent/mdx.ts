export interface ConvertedPage {
  title: string;
  description?: string;
  body: string;
}

export interface ConvertOptions {
  include?: (file: string) => string | undefined;
}

function attribute(attributes: string, name: string): string | undefined {
  const match = attributes.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`)
  );
  if (!match) {
    return undefined;
  }
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? "");
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

function dedent(text: string): string {
  const lines = text.replaceAll(/^\n+|\n+$/g, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
  const width = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(width)).join("\n");
}

function renderCallouts(body: string): string {
  return body.replaceAll(
    /<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g,
    (_match, attributes: string, inner: string) => {
      const title = attribute(attributes, "title");
      const type = attribute(attributes, "type") ?? "note";
      const label =
        title ??
        (type === "warn" ? "Warning" : type === "error" ? "Error" : "Note");
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
    /<Cards\b[^>]*>([\s\S]*?)<\/Cards>/g,
    (_match, inner: string) => {
      const cards = [
        ...inner.matchAll(/<Card\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Card>)/g),
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
    .replaceAll(/<Tabs\b[^>]*>/g, "")
    .replaceAll("</Tabs>", "")
    .replaceAll(/<Tab\b([^>]*)>/g, (_match, attributes: string) => {
      const value =
        attribute(attributes, "value") ?? attribute(attributes, "title");
      return value ? `### ${value}\n` : "";
    })
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
    /^[ \t]*<include\b([^>]*)>([\s\S]*?)<\/include>/gm,
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
    const fence = line.match(/^(\s*)```/);
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

    const leading = line.match(/^\s*/)?.[0].length ?? 0;
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
    .replaceAll(/<br\s*\/?>/g, "\n")
    .replaceAll(/<\/?(?:Callout|Cards|Card|Tabs|Tab|include)\b[^>]*\/?>/g, "")
    .replaceAll(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

export function convertMdx(
  source: string,
  options: ConvertOptions = {}
): ConvertedPage {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const metadata = new Map<string, string>();
  let body = source;

  if (frontmatter) {
    body = source.slice(frontmatter[0].length);
    for (const line of frontmatter[1].split("\n")) {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!match) {
        continue;
      }
      metadata.set(match[1], match[2].replaceAll(/^['"]|['"]$/g, ""));
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
