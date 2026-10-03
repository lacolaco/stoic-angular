import { createRequire } from 'node:module';
import type { Linter } from 'eslint';
import { coreRules, type CoreRuleName } from './core-rules.js';
import { noDeclarableAccessor } from './rules/angular/no-declarable-accessor.js';
import { noDeclarablePrivateMethod } from './rules/angular/no-declarable-private-method.js';
import { noExtraExports } from './rules/angular/no-extra-exports.js';
import { preferInlineTemplate } from './rules/angular/prefer-inline-template.js';
import { noClassInheritance } from './rules/classes/no-class-inheritance.js';
import { callOrPass } from './rules/functions/call-or-pass.js';
import { ifOnlyAtStart } from './rules/functions/if-only-at-start.js';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';
import { noElse } from './rules/functions/no-else.js';
import { noSwitch } from './rules/functions/no-switch.js';
import {
  buildConfig,
  buildDefaultsConfig,
  type ConfigureSettings,
  type DefaultsOverrides,
} from './support/configure.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

export const rules = {
  'call-or-pass': callOrPass,
  'if-only-at-start': ifOnlyAtStart,
  'max-function-lines': maxFunctionLines,
  'no-class-inheritance': noClassInheritance,
  'no-declarable-accessor': noDeclarableAccessor,
  'no-declarable-private-method': noDeclarablePrivateMethod,
  'no-else': noElse,
  'no-extra-exports': noExtraExports,
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

/**
 * Returns a flat config object that registers the plugin and enables every plugin rule and every core rule in `coreRules`
 * with its default options and the `error` severity. `overrides` changes a rule per name: the first option of the rule
 * replaces the default options, `true` keeps them, and `false` leaves the rule out. A rule that is not listed stays enabled.
 */
export function defaults(overrides: DefaultsOverrides<typeof rules, CoreRuleName> = {}): Linter.Config {
  return buildDefaultsConfig(meta.namespace, plugin, Object.keys(rules), overrides, coreRules);
}

// No preset config objects: `configure` enables the chosen rules and `defaults` enables all of them
const plugin = { meta, rules, configure, defaults };

export type { CoreRuleName } from './core-rules.js';
export type {
  ConfigureSettings,
  CoreRuleSetting,
  DefaultsOverrides,
  RuleSetting,
} from './support/configure.js';

export default plugin;
