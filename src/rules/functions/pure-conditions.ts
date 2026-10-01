import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'impureCondition';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

/** Methods whose name makes it certain that a call changes state (a command) */
const MUTATING_METHODS: ReadonlySet<string> = new Set([
  'pop',
  'push',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'fill',
  'copyWithin',
  'add',
  'delete',
  'clear',
  'set',
  'next',
  'exec',
]);

/** Calls whose result changes on every call (not a pure query) */
const NONDETERMINISTIC_CALLEES: ReadonlySet<string> = new Set([
  'Date.now',
  'Math.random',
  'performance.now',
]);

/** Node types that hold a condition. In every one, the test property is the condition */
const CONDITION_NODE_TYPES = [
  'IfStatement',
  'ConditionalExpression',
  'WhileStatement',
  'DoWhileStatement',
  'ForStatement',
] as const;

function identifierText(node: TSESTree.Node | undefined): string {
  return node?.type === 'Identifier' ? node.name : '';
}

function propertyName(callee: TSESTree.Node): string {
  return identifierText(callee.type === 'MemberExpression' ? callee.property : undefined);
}

function calleePath(callee: TSESTree.Node): string {
  const named = callee.type === 'MemberExpression' ? callee : undefined;
  return `${identifierText(named?.object)}.${identifierText(named?.property)}`;
}

function isDirtyCall(callee: TSESTree.Node): boolean {
  return (
    MUTATING_METHODS.has(propertyName(callee)) || NONDETERMINISTIC_CALLEES.has(calleePath(callee))
  );
}

const MUTATION_KINDS: ReadonlySet<string> = new Set(['AssignmentExpression', 'UpdateExpression']);

function isImpure(node: TSESTree.Node): boolean {
  const impureKind =
    MUTATION_KINDS.has(node.type) ||
    (node.type === 'UnaryExpression' && node.operator === 'delete');
  return impureKind || (node.type === 'CallExpression' && isDirtyCall(node.callee));
}

function isAstLike(value: unknown): value is TSESTree.Node {
  const type = (value as { type?: unknown } | null)?.type;
  return typeof value === 'object' && value !== null && typeof type === 'string';
}

/** parent is not followed because it walks back up. loc / range are dropped because they are not nodes */
function childNodesOf(node: TSESTree.Node): TSESTree.Node[] {
  const entries = Object.entries(node).filter(([key]) => key !== 'parent');
  const values = entries.flatMap(([, value]) => (Array.isArray(value) ? value : [value]));
  return values.filter(isAstLike);
}

/** Collects impure operations from the subtree of a condition (including callback bodies) */
function collectImpure(node: TSESTree.Node): TSESTree.Node[] {
  const own = isImpure(node) ? [node] : [];
  const children = childNodesOf(node);
  return [...own, ...children.flatMap(collectImpure)];
}

function auditTest(context: Context, test: TSESTree.Node | null): void {
  const targets = test === null ? [] : collectImpure(test);
  targets.forEach((node) => context.report({ loc: node.loc, messageId: 'impureCondition' }));
}

function makeVisitor(check: (test: TSESTree.Node | null) => void): TSESLint.RuleListener {
  const listener = (node: { test: TSESTree.Node | null }): void => check(node.test);
  return Object.fromEntries(CONDITION_NODE_TYPES.map((type) => [type, listener]));
}

/**
 * Pure conditions: use only side-effect-free queries in conditions (command-query separation).
 * Mutating methods, assignments, increments, and non-deterministic calls are prohibited in condition positions
 */
export const pureConditions = createRule<[], MessageIds>({
  name: 'pure-conditions',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows operations with side effects in conditions.',
    },
    messages: {
      impureCondition:
        'Do not put operations with side effects in a condition. Run them first and bind the result, or separate them into a query (Pure conditions)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return makeVisitor((test) => auditTest(context, test));
  },
});
