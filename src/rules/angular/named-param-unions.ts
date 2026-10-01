import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { enclosingClass, isDecorated } from '../../support/angular-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'namedUnion';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];
type Services = ParserServicesWithTypeInformation;
type Member =
  | TSESTree.MethodDefinition
  | TSESTree.PropertyDefinition
  | TSESTree.TSAbstractMethodDefinition
  | TSESTree.TSAbstractPropertyDefinition;

/** Types that only express omission or absence. Mixing them into a union adds no meaningful option */
const ABSENCE: readonly string[] = ['TSUndefinedKeyword', 'TSNullKeyword', 'TSVoidKeyword'];

/** Markers of non-public members. Callers cannot see these members, so they are ignored */
const HIDDEN: readonly string[] = ['private', 'protected'];

/** Nodes to inspect. abstract members are treated the same way */
const MEMBERS: readonly string[] = [
  'MethodDefinition',
  'PropertyDefinition',
  'TSAbstractMethodDefinition',
  'TSAbstractPropertyDefinition',
];

/** Edges not to follow. parent is circular, and body is the implementation, not the signature */
const SKIPPED: readonly string[] = ['parent', 'body'];

function isViewModel(cls: TSESTree.ClassDeclaration | TSESTree.ClassExpression): boolean {
  return (cls.id?.name ?? '').endsWith('ViewModel');
}

function isTarget(
  services: Services,
  cls: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): boolean {
  const service = isDecorated(services, cls, 'Service') || isDecorated(services, cls, 'Injectable');
  return isViewModel(cls) || service;
}

function isExempt(services: Services, member: Member): boolean {
  const { accessibility, key } = member;
  const hidden = HIDDEN.includes(accessibility ?? '') || key.type === 'PrivateIdentifier';
  return hidden || !isTarget(services, enclosingClass(member));
}

function isNode(value: unknown): value is TSESTree.Node {
  return typeof value === 'object' && value !== null && 'type' in value;
}

/** private constructor parameter properties. Like members, they are invisible to callers */
function isConcealed(node: TSESTree.Node): boolean {
  const declared = node.type === 'TSParameterProperty' ? node : undefined;
  return HIDDEN.includes(declared?.accessibility ?? '');
}

/** All nodes within a signature. Does not enter the implementation or hidden parameter properties */
function signature(node: TSESTree.Node): readonly TSESTree.Node[] {
  const pairs = Object.entries(node).filter(([key]) => !SKIPPED.includes(key));
  const values = pairs.flatMap(([, value]) => (Array.isArray(value) ? value : [value]));
  const kids = values.filter(isNode).filter((child) => !isConcealed(child));
  return [node, ...kids.flatMap(signature)];
}

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

/** Whether this is a union with two or more meaningful options */
function isMultiple(node: TSESTree.Node): boolean {
  const { type } = node;
  const parts = type === 'TSUnionType' ? leaves(node) : [];
  const choices = parts.filter((leaf) => !ABSENCE.includes(leaf.type));
  return choices.length > 1 && !choices.every(isBoolean);
}

/** The outer union is already flagged, so the inner one is not reported */
function isNested(node: TSESTree.Node): boolean {
  return node.parent?.type === 'TSUnionType';
}

function audit(context: Context, services: Services, member: Member): void {
  const scanned = isExempt(services, member) ? [] : signature(member);
  const found = scanned.filter(isMultiple).filter((node) => !isNested(node));
  found.forEach((node) => context.report({ node, messageId: 'namedUnion' }));
}

/**
 * Forbids inline unions in the signatures of public view model and service members.
 * Extract the set of options into a named type. Callers and the implementation can then
 * talk about the same name, and adding an option needs a change in only one place
 */
export const namedParamUnions = createRule<[], MessageIds>({
  name: 'named-param-unions',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires extracting inline union types in public view model and service member signatures into named types.',
      requiresTypeChecking: true,
    },
    messages: {
      namedUnion:
        'Do not write inline unions in the signatures of public view model and service members. Extract them into a named type',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const on = (node: Member) => audit(context, services, node);
    return Object.fromEntries(MEMBERS.map((name) => [name, on]));
  },
});
