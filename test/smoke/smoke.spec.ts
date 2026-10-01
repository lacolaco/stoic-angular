import tsParser from '@typescript-eslint/parser';
import { ESLint, type Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import plugin from '../../src/index';

const cwd = import.meta.dirname;

async function lintSample(): Promise<Linter.LintMessage[]> {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ['**/*.ts'], languageOptions: { parser: tsParser } },
      plugin.configs.recommended as Linter.Config,
    ],
  });
  const [result] = await eslint.lintFiles(['sample.ts']);
  return result.messages;
}

describe('smoke test: applying the recommended config to a sample', () => {
  it('reports max-function-lines only for the function over the limit', async () => {
    const messages = await lintSample();
    const reports = messages.filter((m) => m.ruleId === 'stoic-angular/max-function-lines');
    expect(reports).toHaveLength(1);
    expect(reports[0]?.line).toBe(1);
    expect(messages.some((m) => m.fatal)).toBe(false);
  });
});
