import type { Rule } from '../engine';
import {
  breakingRenamesRule,
  defaultToNamespaceRule,
  modernizeAliasesRule,
  moduleSpecifierRule,
} from './imports';
import { buttonStyleRule } from './builders';
import { eventsRule } from './events';
import { methodRenamesRule, optionKeysRule } from './methods';
import { partialsCastRuleModule } from './partials';
import { markersRule } from './markers';
import { esmConversionRule } from './esm';

const allRules: readonly Rule[] = [
  moduleSpecifierRule,
  breakingRenamesRule,
  modernizeAliasesRule,
  defaultToNamespaceRule,
  methodRenamesRule,
  optionKeysRule,
  eventsRule,
  buttonStyleRule,
  partialsCastRuleModule,
  markersRule,
  esmConversionRule,
];

export interface RunRuleOptions {
  readonly modernize: boolean;
  readonly esm: boolean;
  readonly only?: readonly string[];
}

export function rulesFor(options: RunRuleOptions): Rule[] {
  let visible = allRules.filter((rule) => rule !== esmConversionRule);
  if (options.esm) {
    visible = [...visible, esmConversionRule];
  }
  if (!options.modernize) {
    visible = visible.filter(
      (rule) => rule.tier !== 'modernize' || rule === esmConversionRule
    );
  }
  if (!options.only) {
    return visible;
  }
  const allowed = new Set(options.only);
  return visible.filter(
    (rule) => allowed.has(rule.id) || rule.id === 'markers'
  );
}

export function ruleCatalog(): readonly Rule[] {
  return allRules;
}
