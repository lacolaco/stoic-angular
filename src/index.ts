import { createRequire } from 'node:module';
import type { TSESLint } from '@typescript-eslint/utils';
import { maxFunctionLines } from './rules/functions/max-function-lines.js';

// Resolves the root package.json from both dist/index.js and src/index.ts
const pkg = createRequire(import.meta.url)('../package.json') as { version: string };

export const rules = {
  'max-function-lines': maxFunctionLines,
};

const meta = { name: 'eslint-plugin-stoic-angular', version: pkg.version, namespace: 'stoic-angular' };

// No preset configs: users enable each rule explicitly, knowing what it constrains
const plugin: TSESLint.FlatConfig.Plugin = { meta, rules };

export default plugin;
