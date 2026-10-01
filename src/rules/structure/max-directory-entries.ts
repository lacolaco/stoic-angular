import * as fs from 'node:fs';
import * as path from 'node:path';
import { ESLintUtils, type TSESLint } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'tooManyEntries';
type Options = [{ maxEntries?: number }?];
type Context = TSESLint.RuleContext<MessageIds, Options>;

/** Upper bound of the magical number 7±2 */
const ENTRY_LIMIT = 9;

const HEAD = { line: 1, column: 0 };

/** Specs are shadows of their source files and are not counted. TS files and subdirectories are counted */
function isCounted(entry: fs.Dirent): boolean {
  const source = entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts');
  return entry.isDirectory() || source;
}

function tally(dir: string): number {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.filter(isCounted).length;
  } catch {
    return 0;
  }
}

function audit(context: Context, limit: number): void {
  const { filename } = context;
  const dir = path.dirname(filename);
  const count = tally(dir);
  flag(context, count, limit, count > limit);
}

function flag(context: Context, count: number, limit: number, violated: boolean): void {
  if (violated) {
    const data = { count: String(count), limit: String(limit) };
    context.report({ loc: HEAD, messageId: 'tooManyEntries', data });
  }
}

/**
 * Keep the number of direct entries of a directory within the upper bound of the magical number (7±2).
 * When exceeded, group and classify them into subdirectories
 */
export const maxDirectoryEntries = createRule<Options, MessageIds>({
  name: 'max-directory-entries',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Limits the number of direct entries in a directory.',
    },
    messages: {
      tooManyEntries:
        'The directory has {{count}} direct entries (at most {{limit}}). Group and classify them into subdirectories (magical number)',
    },
    schema: [
      {
        type: 'object',
        properties: { maxEntries: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const { options } = context;
    const limit = options[0]?.maxEntries ?? ENTRY_LIMIT;
    return { Program: () => audit(context, limit) };
  },
});
