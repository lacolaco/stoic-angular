import tsParser from '@typescript-eslint/parser';
import { ESLint, type Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import { describe, expect, it } from 'vitest';
import plugin from '../../src/index';

const cwd = import.meta.dirname;

async function lintSample(settings: Parameters<typeof plugin.configure>[0]): Promise<Linter.LintMessage[]> {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: defineConfig({
      files: ['**/*.ts'],
      languageOptions: { parser: tsParser },
      extends: [plugin.configure(settings)],
    }),
  });
  const [result] = await eslint.lintFiles(['sample.ts']);
  return result.messages;
}

const ruleId = 'stoic-angular/max-function-lines';

describe('smoke test: enabling a rule through configure in defineConfig extends', () => {
  it('reports max-function-lines only for the function over the limit', async () => {
    const messages = await lintSample({ 'max-function-lines': true });
    const reports = messages.filter((m) => m.ruleId === ruleId);
    expect(reports).toHaveLength(1);
    expect(reports[0]?.line).toBe(1);
    expect(reports[0]?.severity).toBe(2);
    expect(messages.some((m) => m.fatal)).toBe(false);
  });

  it('applies the maxLines option', async () => {
    const strict = await lintSample({ 'max-function-lines': { maxLines: 1 } });
    expect(strict.filter((m) => m.ruleId === ruleId).map((m) => m.line)).toEqual([1, 11]);
    const loose = await lintSample({ 'max-function-lines': { maxLines: 10 } });
    expect(loose.filter((m) => m.ruleId === ruleId)).toHaveLength(0);
  });

  it('enables no rule that is not listed', async () => {
    const messages = await lintSample({});
    expect(messages.filter((m) => m.ruleId === ruleId)).toHaveLength(0);
  });

  it('reports a nested ternary only when no-nested-ternary is enabled', async () => {
    const messages = await lintSample({ 'no-nested-ternary': true });
    const reports = messages.filter((m) => m.ruleId === 'no-nested-ternary');
    expect(reports).toHaveLength(1);
    expect(reports[0]?.line).toBe(18);
    expect(reports[0]?.severity).toBe(2);
    const none = await lintSample({});
    expect(none.filter((m) => m.ruleId === 'no-nested-ternary')).toHaveLength(0);
  });

  it('applies the complexity limit when complexity is enabled', async () => {
    const messages = await lintSample({ complexity: 2 });
    const reports = messages.filter((m) => m.ruleId === 'complexity');
    expect(reports.map((m) => m.line)).toEqual([17]);
    expect(reports[0]?.severity).toBe(2);
  });

  it('reports the comma operator only when no-sequences is enabled', async () => {
    const messages = await lintSample({ 'no-sequences': true });
    const reports = messages.filter((m) => m.ruleId === 'no-sequences');
    expect(reports.map((m) => m.line)).toEqual([22]);
    const none = await lintSample({});
    expect(none.filter((m) => m.ruleId === 'no-sequences')).toHaveLength(0);
  });
});
