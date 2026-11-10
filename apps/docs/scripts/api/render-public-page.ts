import { renderSummary } from "./comment";
import type { DocgenClass, DocgenType } from "./enrich";
import { renderClassPage } from "./render-class";
import {
  renderEnumMembersPage,
  renderFunctionPage,
  renderVariablePage,
} from "./render-misc";
import { renderTypingsPage } from "./render-typings";
import { Kind } from "./types";
import type { PublicExport, Reflection } from "./types";

function enumMembers(
  reflection: Reflection | undefined
): Reflection[] | undefined {
  if (!reflection || reflection.kind !== Kind.Variable) {
    return undefined;
  }
  const members = reflection.type?.declaration?.children;
  if (!members?.length) {
    return undefined;
  }
  return members.every((member) => member.type?.type === "literal")
    ? members
    : undefined;
}

export function renderPublicPage(input: {
  exported: PublicExport;
  typings?: Reflection;
  sourceUrl?: string;
  docgen?: DocgenClass | DocgenType;
  privateMembers?: string[];
}): string | undefined {
  const { typings } = input;
  if (!typings) {
    return undefined;
  }

  const pageInput = {
    name: input.exported.name,
    sourceUrl: input.sourceUrl,
    typings,
  };

  const members = enumMembers(typings);
  if (members) {
    return renderEnumMembersPage({
      description: renderSummary(typings.comment),
      members,
      name: input.exported.name,
      sourceUrl: input.sourceUrl,
    });
  }

  if (typings.kind === Kind.Class) {
    return renderClassPage({
      events: (input.docgen as DocgenClass | undefined)?.events,
      name: input.exported.name,
      privateMembers: input.privateMembers,
      sourceUrl: input.sourceUrl,
      typings,
    });
  }

  if (typings.kind === Kind.Interface || typings.kind === Kind.TypeAlias) {
    return renderTypingsPage({
      reflections: [typings],
      sourceUrl: input.sourceUrl,
      title: input.exported.name,
    });
  }

  if (typings.signatures?.length) {
    return renderFunctionPage(pageInput);
  }
  return renderVariablePage(pageInput);
}
