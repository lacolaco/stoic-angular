import { createRequire } from 'node:module';
import type { TSESLint } from '@typescript-eslint/utils';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

const NAMESPACE = 'stoic-angular';

export const rules = {
  'max-function-lines': maxFunctionLines,
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
};

export default { meta, rules, configs };
