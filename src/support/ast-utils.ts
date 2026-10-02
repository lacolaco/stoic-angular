import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export type FunctionNode =
  TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

export function distinct<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

export function allScopes(sourceCode: TSESLint.SourceCode): TSESLint.Scope.Scope[] {
  const { scopeManager } = sourceCode;
  return scopeManager?.scopes ?? [];
}

export const FUNCTION_TYPES: ReadonlySet<string> = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

/** TS assertions do not hide a use. Dig down to the effective use node and its parent */
const ASSERTION_KINDS: ReadonlySet<string> = new Set([
  'TSNonNullExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
]);

export function effectiveUse(node: TSESTree.Node): {
  use: TSESTree.Node;
  parent: TSESTree.Node | undefined;
} {
  const { parent } = node;
  const { type } = parent ?? { type: undefined };
  return parent !== undefined && type !== undefined && ASSERTION_KINDS.has(type)
    ? effectiveUse(parent)
    : { use: node, parent };
}

export function isReceiver(parent: TSESTree.Node, id: TSESTree.Node): boolean {
  return parent.type === 'MemberExpression' && parent.object === id;
}

function argumentsIn(container: TSESTree.Node | undefined): readonly TSESTree.Node[] {
  const isCall = container?.type === 'CallExpression' || container?.type === 'NewExpression';
  return isCall ? ((container as TSESTree.CallExpression).arguments as TSESTree.Node[]) : [];
}

/** Dig through a spread (fn(...x)) by one level and decide whether it is an argument of a call or new */
export function isCallArgument(parent: TSESTree.Node, id: TSESTree.Node): boolean {
  const viaSpread = parent.type === 'SpreadElement';
  const container = viaSpread ? parent.parent : parent;
  const argument: TSESTree.Node = viaSpread ? parent : id;
  return argumentsIn(container).includes(argument);
}

function parentOf(node: TSESTree.Node): TSESTree.Node | undefined {
  return node.parent;
}

function isFn(node: TSESTree.Node): node is FunctionNode {
  return FUNCTION_TYPES.has(node.type);
}

/** Collects the function nodes wrapping a node, from innermost to outermost */
export function enclosingFunctions(id: TSESTree.Node): FunctionNode[] {
  const chain: TSESTree.Node[] = [];
  for (let node = id.parent; node; node = parentOf(node)) {
    chain.push(node);
  }
  return chain.filter(isFn);
}

export function isWrapping(outer: TSESTree.Node, inner: TSESTree.Node): boolean {
  return outer.range[0] <= inner.range[0] && inner.range[1] <= outer.range[1];
}

/** Keeps only the candidates (innermost ones) that contain no other candidate inside */
export function innermostOnly(candidates: readonly FunctionNode[]): FunctionNode[] {
  return candidates.filter(
    (fn) => !candidates.some((inner) => inner !== fn && isWrapping(fn, inner)),
  );
}
