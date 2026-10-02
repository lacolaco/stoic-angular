import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'noDefault' | 'caseMustReturn';

function isReturning(statements: readonly TSESTree.Statement[]): boolean {
  const last = statements[statements.length - 1];
  const lastOfBlock = last?.type === 'BlockStatement' ? last.body[last.body.length - 1] : last;
  return lastOfBlock?.type === 'ReturnStatement';
}

/** An empty case grouped by fallthrough is allowed unless it is the last one */
function isTolerable(switchCase: TSESTree.SwitchCase, isLast: boolean): boolean {
  const { consequent } = switchCase;
  const { length } = consequent;
  return (length === 0 && !isLast) || isReturning(consequent);
}

function caseFinding(
  switchCase: TSESTree.SwitchCase,
  isLast: boolean,
): { node: TSESTree.SwitchCase; messageId: MessageIds } | null {
  const { test } = switchCase;
  const messageId = test === null ? 'noDefault' : 'caseMustReturn';
  const compliant = test !== null && isTolerable(switchCase, isLast);
  return compliant ? null : { node: switchCase, messageId };
}

function findingsIn(
  node: TSESTree.SwitchStatement,
): { node: TSESTree.SwitchCase; messageId: MessageIds }[] {
  const { cases } = node;
  const { length } = cases;
  return cases.flatMap((switchCase, index) => caseFinding(switchCase, index === length - 1) ?? []);
}

/**
 * Avoid switch in principle. When used, it has no default, every case returns,
 * and exhaustiveness is guaranteed by type checking (switch-exhaustiveness-check and noImplicitReturns)
 */
export const noSwitch = createRule<[], MessageIds>({
  name: 'no-switch',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows default in switch and requires every case to end with return.',
    },
    messages: {
      noDefault:
        'Do not write default in a switch. Guarantee exhaustiveness through types so that a missing case becomes a compile error (Never use switch)',
      caseMustReturn: 'Every case of a switch must end with return (Never use switch)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      SwitchStatement(node) {
        findingsIn(node).forEach((finding) => context.report(finding));
      },
    };
  },
});
