import { createRequire } from 'node:module';
import type { Linter } from 'eslint';
import { coreRules, type CoreRuleName } from './core-rules.js';
import { preferInlineTemplate } from './rules/angular/prefer-inline-template.js';
import { ifOnlyAtStart } from './rules/functions/if-only-at-start.js';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';
import { noElse } from './rules/functions/no-else.js';
import { noSwitch } from './rules/functions/no-switch.js';
import { buildConfig, type ConfigureSettings } from './support/configure.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

export const rules = {
  'if-only-at-start': ifOnlyAtStart,
  'max-function-lines': maxFunctionLines,
  'no-else': noElse,
  'no-switch': noSwitch,
  'prefer-inline-template': preferInlineTemplate,
};

const meta = { name: 'eslint-plugin-stoic-angular', version: pkg.version, namespace: 'stoic-angular' };

/**
 * Returns a flat config object that registers the plugin and enables only the rules listed in `settings`.
 * A key is a plugin rule name or the name of a core rule listed in `coreRules`. The severity is always `error`. `true` enables a rule with its default options.
 */
export function configure(settings: ConfigureSettings<typeof rules, CoreRuleName>): Linter.Config {
  return buildConfig(meta.namespace, plugin, settings, coreRules);
}

// No preset configs: users enable each rule explicitly, knowing what it constrains
const plugin = { meta, rules, configure };

export type { CoreRuleName } from './core-rules.js';
export type { ConfigureSettings, CoreRuleSetting, RuleSetting } from './support/configure.js';

export default plugin;
