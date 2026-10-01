import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { maxLinesOption } from '../../support/options.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'tooLong';
type Options = [{ maxLines?: number }?];

const LINE_LIMIT = 5;

/** Lines without logic (blank lines and lines of only { } ( ) [ ] ; ,) are not counted */
const PUNCTUATION_ONLY = /^[{}()[\];,]*$/;

function logicCount(sourceCode: TSESLint.SourceCode, body: TSESTree.Node): number {
  const lines = sourceCode.getText(body).split('\n');
  return lines.filter((line) => !PUNCTUATION_ONLY.test(line.trim())).length;
}

type FunctionNode =
  TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

type Context = TSESLint.RuleContext<MessageIds, Options>;

function reportIfTooLong(
  context: Context,
  maxLines: number,
  node: FunctionNode,
  lines: number,
): void {
  if (lines > maxLines) {
    context.report({
      node,
      messageId: 'tooLong',
      data: { lines: String(lines), max: String(maxLines) },
    });
  }
}

function makeListener(context: Context, maxLines: number, sourceCode: TSESLint.SourceCode) {
  return (node: FunctionNode): void => {
    const { body } = node;
    reportIfTooLong(context, maxLines, node, logicCount(sourceCode, body));
  };
}

function visitorFor(listener: (node: FunctionNode) => void): TSESLint.RuleListener {
  return {
    FunctionDeclaration: listener,
    FunctionExpression: listener,
    ArrowFunctionExpression: listener,
  } as TSESLint.RuleListener;
}

/** Five lines rule: the body of a function or method has at most maxLines lines of logic (default 5) */
export const maxFunctionLines = createRule<Options, MessageIds>({
  name: 'max-function-lines',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Limits the number of logic lines in a function body.',
    },
    messages: {
      tooLong:
        'The function body has {{lines}} lines of logic. Split it so that it has at most {{max}} lines (five lines rule)',
    },
    schema: [
      {
        type: 'object',
        properties: { maxLines: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const { sourceCode } = context;
    const maxLines = maxLinesOption(context, LINE_LIMIT);
    return visitorFor(makeListener(context, maxLines, sourceCode));
  },
});
