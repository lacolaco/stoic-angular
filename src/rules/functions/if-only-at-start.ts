import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { FUNCTION_TYPES, enclosingFunctions } from '../../support/ast-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'notAtStart';

/** An else if chain is regarded as part of the leading if */
function isChainedElse(node: TSESTree.IfStatement, parent: TSESTree.Node): boolean {
  return parent.type === 'IfStatement' && parent.alternate === node;
}

function asBlock(parent: TSESTree.Node): TSESTree.BlockStatement | undefined {
  return parent.type === 'BlockStatement' ? parent : undefined;
}

function functionBodyOf(parent: TSESTree.Node): readonly TSESTree.Statement[] | undefined {
  const block = asBlock(parent);
  const grandType = block?.parent.type ?? '';
  return FUNCTION_TYPES.has(grandType) ? block?.body : undefined;
}

/** Whether it is the first and only statement of the function body */
function isSoleStatement(node: TSESTree.IfStatement, parent: TSESTree.Node): boolean {
  const body = functionBodyOf(parent) ?? [];
  return body[0] === node && body.length === 1;
}

/** The rule concerns the inside of functions. An if outside a function (module level or static block) is out of scope */
function isCompliant(node: TSESTree.IfStatement): boolean {
  const { parent } = node;
  const insideFunction = enclosingFunctions(node).length > 0;
  return !insideFunction || isChainedElse(node, parent) || isSoleStatement(node, parent);
}

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

function reportMisplaced(context: Context, node: TSESTree.IfStatement): void {
  const { loc } = node;
  const ifToken = context.sourceCode.getFirstToken(node);
  context.report({ loc: ifToken?.loc ?? loc, messageId: 'notAtStart' });
}

function flagViolation(context: Context, node: TSESTree.IfStatement): void {
  if (!isCompliant(node)) {
    reportMisplaced(context, node);
  }
}

/**
 * Only use if at the start: an if statement goes at the start of a function body, and the function does nothing else.
 * If an if is needed elsewhere, extract it into a function whose only statement is the if
 */
export const ifOnlyAtStart = createRule<[], MessageIds>({
  name: 'if-only-at-start',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires an if statement to be only at the start of a function, which does nothing else.',
    },
    messages: {
      notAtStart:
        'Put an if statement at the start of a function, and let that function do nothing else. Extract the if into a function whose only statement is the if (Only use if at the start)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        flagViolation(context, node);
      },
    };
  },
});
