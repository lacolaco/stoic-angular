import * as fs from 'node:fs';
import * as path from 'node:path';
import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { maxLinesOption } from '../../support/options.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'inline';
type Options = [{ maxLines?: number }?];
type Context = TSESLint.RuleContext<MessageIds, Options>;

const DEFAULT_MAX_LINES = 10;

/** Selector that targets only templateUrl directly under the @Component decorator's argument object */
const TEMPLATE_PROPERTY_SELECTOR =
  'Decorator > CallExpression[callee.name="Component"] > ObjectExpression > Property[key.name="templateUrl"]';

function safeRead(file: string): string | null {
  try {
    return fs.readFileSync(file, 'utf-8').replace(/\n$/, '');
  } catch {
    return null;
  }
}

function loadReferenced(context: Context, templateUrl: string): string | null {
  const file = path.resolve(path.dirname(context.filename), templateUrl);
  return safeRead(file);
}

function escapeForBacktick(content: string): string {
  return content.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
}

/** Re-lays the body one level deeper to match the property indent (default 2) */
function buildBody(content: string, escaped: string, column: number): string {
  const indent = ' '.repeat(column + 2);
  const body = `\n${indent}${escaped.split('\n').join(`\n${indent}`)}\n${' '.repeat(column)}`;
  return content.trim() === '' ? '' : body;
}

function indentColumn(node: TSESTree.Node): number {
  return node.loc.start.column;
}

function toReplacement(
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Node,
  content: string,
): TSESLint.RuleFix {
  const column = indentColumn(node);
  const escaped = escapeForBacktick(content);
  const body = buildBody(content, escaped, column);
  return fixer.replaceText(node, `template: \`${body}\``);
}

function lineTotal(content: string): number {
  return content.split('\n').length;
}

function reportViolation(
  context: Context,
  maxLines: number,
  node: TSESTree.Node,
  content: string,
): void {
  const lines = lineTotal(content);
  const data = { lines: String(lines), max: String(maxLines) };
  const fix: TSESLint.ReportFixFunction = (fixer) => toReplacement(fixer, node, content);
  context.report({ node, messageId: 'inline', data, fix });
}

function flagCandidate(
  context: Context,
  maxLines: number,
  node: TSESTree.Node,
  content: string | null,
): void {
  if (content !== null && lineTotal(content) <= maxLines) {
    reportViolation(context, maxLines, node, content);
  }
}

function urlOf(node: TSESTree.Node): string | null {
  const value = node.type === 'Property' ? node.value : undefined;
  const literal = value?.type === 'Literal' ? value.value : undefined;
  return typeof literal === 'string' ? literal : null;
}

function resolveContent(context: Context, node: TSESTree.Node): string | null {
  const templateUrl = urlOf(node);
  return templateUrl === null ? null : loadReferenced(context, templateUrl);
}

function checkNode(context: Context, maxLines: number, node: TSESTree.Node): void {
  flagCandidate(context, maxLines, node, resolveContent(context, node));
}

/**
 * Measures the line count of the file referenced by templateUrl and requires an inline template
 * when it is at or below the threshold. The threshold can be changed with the { maxLines } option (default 10)
 */
export const preferInlineTemplate = createRule<Options, MessageIds>({
  name: 'prefer-inline-template',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires short templates to be inline templates instead of templateUrl.',
    },
    fixable: 'code',
    messages: {
      inline:
        'The template is {{lines}} lines ({{max}} or fewer), so use an inline template instead of templateUrl (delete the HTML file that becomes unnecessary after --fix)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxLines: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const maxLines = maxLinesOption(context, DEFAULT_MAX_LINES);
    return {
      [TEMPLATE_PROPERTY_SELECTOR]: (node: TSESTree.Node) => checkNode(context, maxLines, node),
    };
  },
});
