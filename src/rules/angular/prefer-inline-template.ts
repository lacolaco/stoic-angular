import * as fs from 'node:fs';
import * as path from 'node:path';
import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { maxLinesOption } from '../../support/options.js';
import { createRule } from '../../support/create-rule.js';
import { isAngularCoreDecorator } from '../../support/angular-imports.js';

type MessageIds = 'inline';
type Options = [{ maxLines?: number }?];
type Context = TSESLint.RuleContext<MessageIds, Options>;

const DEFAULT_MAX_LINES = 10;

/** Selector that targets templateUrl directly under a decorator call's argument object; the handler checks that the decorator is Component from @angular/core */
const TEMPLATE_PROPERTY_SELECTOR =
  'Decorator > CallExpression > ObjectExpression > Property[key.name="templateUrl"]';

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

/** Re-lays the body one level deeper (2 spaces) than the indent of the line holding templateUrl */
function buildBody(content: string, escaped: string, indent: string): string {
  const inner = `${indent}  `;
  const body = `\n${inner}${escaped.split('\n').join(`\n${inner}`)}\n${indent}`;
  return content.trim() === '' ? '' : body;
}

/** The leading whitespace of the line, as written (spaces or tabs), not the column of the property */
function lineIndent(context: Context, node: TSESTree.Node): string {
  const line = context.sourceCode.lines[node.loc.start.line - 1] ?? '';
  return /^[ \t]*/.exec(line)?.[0] ?? '';
}

function toReplacement(
  context: Context,
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Node,
  content: string,
): TSESLint.RuleFix {
  const indent = lineIndent(context, node);
  const escaped = escapeForBacktick(content);
  const body = buildBody(content, escaped, indent);
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
  const fix: TSESLint.ReportFixFunction = (fixer) => toReplacement(context, fixer, node, content);
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

function isComponentDecorated(context: Context, node: TSESTree.Node): boolean {
  const decorator = node.parent?.parent?.parent;
  return (
    decorator?.type === 'Decorator' &&
    isAngularCoreDecorator(context.sourceCode.ast, decorator, 'Component')
  );
}

function checkNode(context: Context, maxLines: number, node: TSESTree.Node): void {
  if (isComponentDecorated(context, node)) {
    flagCandidate(context, maxLines, node, resolveContent(context, node));
  }
}

/**
 * Identifies the decorator through the @angular/core import (named, aliased and namespace imports).
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
