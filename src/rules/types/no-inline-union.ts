import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'namedUnion';

/** Types that only express omission or absence. Mixing them into a union adds no meaningful option */
const ABSENCE: readonly string[] = ['TSUndefinedKeyword', 'TSNullKeyword', 'TSVoidKeyword'];

/** Leaves of the flattened union. Options split by nested parentheses are counted one by one */
function leaves(node: TSESTree.Node): readonly TSESTree.Node[] {
  const union = node.type === 'TSUnionType' ? node : undefined;
  return union === undefined ? [node] : union.types.flatMap(leaves);
}

/** A pair of true and false already has the name boolean, so there is nothing to extract to */
function isBoolean(node: TSESTree.Node): boolean {
  const literal = node.type === 'TSLiteralType' ? node.literal : undefined;
  return literal?.type === 'Literal' && typeof literal.value === 'boolean';
}

/** Whether this union has two or more meaningful options */
function isMultiple(node: TSESTree.TSUnionType): boolean {
  const choices = leaves(node).filter((leaf) => !ABSENCE.includes(leaf.type));
  return choices.length > 1 && !choices.every(isBoolean);
}

/** The outer union is already flagged, so the inner one is not reported */
function isNested(node: TSESTree.Node): boolean {
  return node.parent?.type === 'TSUnionType';
}

/** Whether the node is inside a type alias declaration, the one place where a union gets its name */
function isInsideAlias(node: TSESTree.Node): boolean {
  const { parent } = node;
  return parent != null && (parent.type === 'TSTypeAliasDeclaration' || isInsideAlias(parent));
}

/**
 * Forbids inline union types anywhere except inside a type alias declaration.
 * Extract the set of options into a named type. Callers and the implementation can then
 * talk about the same name, and adding an option needs a change in only one place
 */
export const noInlineUnion = createRule<[], MessageIds>({
  name: 'no-inline-union',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires union types to be written only inside type alias declarations.',
    },
    messages: {
      namedUnion: 'Do not write inline unions. Extract them into a named type alias',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSUnionType(node) {
        const skipped = isNested(node) || isInsideAlias(node) || !isMultiple(node);
        if (!skipped) {
          context.report({ node, messageId: 'namedUnion' });
        }
      },
    };
  },
});
