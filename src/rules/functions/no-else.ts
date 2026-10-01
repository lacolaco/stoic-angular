import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'noElse';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

/** Report on the if keyword so that a disable comment can be placed on the line right before the if */
function flagAlternate(context: Context, node: TSESTree.IfStatement): void {
  const { loc } = node;
  const ifToken = context.sourceCode.getFirstToken(node);
  context.report({ loc: ifToken?.loc ?? loc, messageId: 'noElse' });
}

function auditBranch(
  context: Context,
  node: TSESTree.IfStatement,
  alternate: TSESTree.Statement | null,
): void {
  if (alternate !== null) {
    flagAlternate(context, node);
  }
}

/**
 * Never use if with else: express branching with early return, the conditional operator, or polymorphism.
 * Only checks of external data types are excluded, with an eslint-disable comment stating the reason
 */
export const noElse = createRule<[], MessageIds>({
  name: 'no-else',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows combining if and else.',
    },
    messages: {
      noElse:
        'Do not use if together with else. Express branching with early return, the conditional operator, or polymorphism (checks of external data types are excluded with an eslint-disable comment stating the reason) (Never use if with else)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        const { alternate } = node;
        auditBranch(context, node, alternate);
      },
    };
  },
});
