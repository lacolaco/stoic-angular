import { createRequire } from 'node:module';
import type { Linter } from 'eslint';
import { ifOnlyAtStart } from './rules/functions/if-only-at-start.js';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';
import { noElse } from './rules/functions/no-else.js';
import { buildConfig, type ConfigureSettings } from './support/configure.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

export const rules = {
  'if-only-at-start': ifOnlyAtStart,
  'max-function-lines': maxFunctionLines,
  'no-else': noElse,
};

const meta = { name: 'eslint-plugin-stoic-angular', version: pkg.version, namespace: 'stoic-angular' };

/**
 * Returns a flat config object that registers the plugin and enables only the rules listed in `settings`.
 * The severity is always `error`. `true` enables a rule with its default options.
 */
export function configure(settings: ConfigureSettings<typeof rules>): Linter.Config {
  return buildConfig(meta.namespace, plugin, settings);
}

// No preset configs: users enable each rule explicitly, knowing what it constrains
const plugin = { meta, rules, configure };

export type { ConfigureSettings, RuleSetting } from './support/configure.js';

export default plugin;
