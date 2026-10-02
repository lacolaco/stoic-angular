import type { TSESTree } from '@typescript-eslint/utils';

export type FunctionNode =
  TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

export const FUNCTION_TYPES: ReadonlySet<string> = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

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
