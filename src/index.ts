import { createRequire } from 'node:module';
import type { TSESLint } from '@typescript-eslint/utils';
import { componentSignature } from './rules/angular/component-signature.js';
import { injectableJsdoc } from './rules/angular/injectable-jsdoc.js';
import { inlineShortTemplates } from './rules/angular/inline-short-templates.js';
import { namedParamUnions } from './rules/angular/named-param-unions.js';
import { vmSignature } from './rules/angular/vm-signature.js';
import { noClassInheritance } from './rules/classes/no-class-inheritance.js';
import { noCommonAffixes } from './rules/classes/no-common-affixes.js';
import { noDataClump } from './rules/classes/no-data-clump.js';
import { noGetterSetter } from './rules/classes/no-getter-setter.js';
import { noSingleImplementationInterface } from './rules/classes/no-single-implementation-interface.js';
import { callOrPass } from './rules/functions/call-or-pass.js';
import { ifOnlyAtStart } from './rules/functions/if-only-at-start.js';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';
import { noElse } from './rules/functions/no-else.js';
import { noSwitch } from './rules/functions/no-switch.js';
import { pureConditions } from './rules/functions/pure-conditions.js';
import { maxDirectoryEntries } from './rules/structure/max-directory-entries.js';
import { noStateOnlyService } from './rules/structure/no-state-only-service.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

const NAMESPACE = 'stoic-angular';

export const rules = {
  'call-or-pass': callOrPass,
  'component-signature': componentSignature,
  'if-only-at-start': ifOnlyAtStart,
  'injectable-jsdoc': injectableJsdoc,
  'inline-short-templates': inlineShortTemplates,
  'max-directory-entries': maxDirectoryEntries,
  'max-function-lines': maxFunctionLines,
  'named-param-unions': namedParamUnions,
  'no-class-inheritance': noClassInheritance,
  'no-common-affixes': noCommonAffixes,
  'no-data-clump': noDataClump,
  'no-else': noElse,
  'no-getter-setter': noGetterSetter,
  'no-single-implementation-interface': noSingleImplementationInterface,
  'no-state-only-service': noStateOnlyService,
  'no-switch': noSwitch,
  'pure-conditions': pureConditions,
  'vm-signature': vmSignature,
};

const meta = { name: 'eslint-plugin-stoic-angular', version: pkg.version, namespace: NAMESPACE };

const plugin: TSESLint.FlatConfig.Plugin = { meta, rules };

type RuleEntry = [string, (typeof rules)[keyof typeof rules]];

function enabledRules(includeTypeChecked: boolean): TSESLint.FlatConfig.Rules {
  const entries = (Object.entries(rules) as RuleEntry[])
    .filter(([, rule]) => includeTypeChecked || rule.meta.docs?.requiresTypeChecking !== true)
    .map(([name]) => [`${NAMESPACE}/${name}`, 'error'] as const);
  return Object.fromEntries(entries);
}

function flatConfig(includeTypeChecked: boolean): TSESLint.FlatConfig.Config {
  return { plugins: { [NAMESPACE]: plugin }, rules: enabledRules(includeTypeChecked) };
}

export const configs = {
  recommended: flatConfig(false),
  'recommended-type-checked': flatConfig(true),
};

export default { meta, rules, configs };
