import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'noGetterSetter' | 'boolNeedsIs';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type Services = ParserServicesWithTypeInformation;

const NAMING_PATTERN = /^(get|set)[A-Z_$]/;

const IS_PATTERN = /^is([A-Z_$]|$)/;

function declaredName(node: TSESTree.MethodDefinition): string {
  const { key } = node;
  return key.type === 'Identifier' || key.type === 'PrivateIdentifier' ? key.name : '';
}

/** Whether this is a syntactic get/set accessor or a method named getXxx / setXxx */
function isAccessorLike(node: TSESTree.MethodDefinition): boolean {
  const { kind } = node;
  const isSyntaxAccessor = kind === 'get' || kind === 'set';
  return isSyntaxAccessor || NAMING_PATTERN.test(declaredName(node));
}

function isBooleanish(type: ts.Type): boolean {
  const { flags } = type;
  return (flags & (ts.TypeFlags.BooleanLike | ts.TypeFlags.Boolean)) !== 0;
}

function resultOf(checker: ts.TypeChecker, declaration: ts.SignatureDeclaration): ts.Type {
  const signature = checker.getSignatureFromDeclaration(declaration);
  return signature === undefined ? checker.getAnyType() : signature.getReturnType();
}

function firstParameterType(
  checker: ts.TypeChecker,
  declaration: ts.SignatureDeclaration,
): ts.Type {
  const parameter = declaration.parameters[0];
  return parameter === undefined ? checker.getAnyType() : checker.getTypeAtLocation(parameter);
}

/** Exception for boolean fields: allow a getter if its return value is boolean, and a setter if its first parameter is boolean */
function isExempted(
  checker: ts.TypeChecker,
  declaration: ts.SignatureDeclaration,
  isSetter: boolean,
): boolean {
  const type = isSetter ? firstParameterType(checker, declaration) : resultOf(checker, declaration);
  return isBooleanish(type);
}

function isWriting(node: TSESTree.MethodDefinition): boolean {
  const { kind } = node;
  return kind === 'set' || declaredName(node).startsWith('set');
}

function flagViolation(
  context: Context,
  node: TSESTree.MethodDefinition,
  messageId: MessageIds,
): void {
  const { key } = node;
  context.report({ node: key, messageId });
}

/** Whether this is a query (get accessor or method) returning boolean. Setters are out of scope */
function isBoolQuery(
  checker: ts.TypeChecker,
  declaration: ts.SignatureDeclaration,
  node: TSESTree.MethodDefinition,
): boolean {
  const { kind } = node;
  return kind !== 'set' && isBooleanish(resultOf(checker, declaration));
}

function auditShape(
  context: Context,
  checker: ts.TypeChecker,
  declaration: ts.SignatureDeclaration,
  node: TSESTree.MethodDefinition,
): void {
  const accessorLike = isAccessorLike(node);
  const excepted = accessorLike && isExempted(checker, declaration, isWriting(node));
  reportUnlessExcepted(context, node, accessorLike && !excepted);
}

function enforceIsPrefix(
  context: Context,
  checker: ts.TypeChecker,
  declaration: ts.SignatureDeclaration,
  node: TSESTree.MethodDefinition,
): void {
  const bool = isBoolQuery(checker, declaration, node);
  requireMarker(context, node, bool && !IS_PATTERN.test(declaredName(node)));
}

function requireMarker(context: Context, node: TSESTree.MethodDefinition, violated: boolean): void {
  if (violated) {
    flagViolation(context, node, 'boolNeedsIs');
  }
}

function fnLabel(node: TSESTree.FunctionDeclaration): string {
  return node.id?.name ?? '';
}

function denounce(context: Context, node: TSESTree.FunctionDeclaration, violated: boolean): void {
  if (violated) {
    const { id } = node;
    context.report({ node: id ?? node, messageId: 'boolNeedsIs' });
  }
}

function inspectDeclaration(
  context: Context,
  checker: ts.TypeChecker,
  esMap: Services['esTreeNodeToTSNodeMap'],
  node: TSESTree.FunctionDeclaration,
): void {
  const declaration = esMap.get(node) as ts.SignatureDeclaration;
  const bool = isBooleanish(resultOf(checker, declaration));
  denounce(context, node, bool && !IS_PATTERN.test(fnLabel(node)));
}

function observeDeclarations(context: Context, services: Services) {
  const { program, esTreeNodeToTSNodeMap } = services;
  const checker = program.getTypeChecker();
  return (node: TSESTree.FunctionDeclaration): void =>
    inspectDeclaration(context, checker, esTreeNodeToTSNodeMap, node);
}

/** Whether every call returns boolean (such as Signal<boolean> or a function field) */
function isPredicateShaped(checker: ts.TypeChecker, type: ts.Type): boolean {
  const calls = type.getCallSignatures();
  return calls.length > 0 && calls.every((sig) => isBooleanish(sig.getReturnType()));
}

function scold(context: Context, node: TSESTree.PropertyDefinition, violated: boolean): void {
  if (violated) {
    const { key } = node;
    context.report({ node: key, messageId: 'boolNeedsIs' });
  }
}

function located(
  checker: ts.TypeChecker,
  esMap: Services['esTreeNodeToTSNodeMap'],
  node: TSESTree.PropertyDefinition,
): ts.Type {
  return checker.getTypeAtLocation(esMap.get(node));
}

function vetField(
  context: Context,
  checker: ts.TypeChecker,
  esMap: Services['esTreeNodeToTSNodeMap'],
  node: TSESTree.PropertyDefinition,
): void {
  const { key } = node;
  const title = key.type === 'Identifier' || key.type === 'PrivateIdentifier' ? key.name : '';
  const type = located(checker, esMap, node);
  scold(context, node, isPredicateShaped(checker, type) && !IS_PATTERN.test(title));
}

function watchFields(context: Context, services: Services) {
  const { program, esTreeNodeToTSNodeMap } = services;
  const checker = program.getTypeChecker();
  return (node: TSESTree.PropertyDefinition): void =>
    vetField(context, checker, esTreeNodeToTSNodeMap, node);
}

function checkMethod(
  context: Context,
  checker: ts.TypeChecker,
  esMap: Services['esTreeNodeToTSNodeMap'],
  node: TSESTree.MethodDefinition,
): void {
  const declaration = esMap.get(node) as ts.SignatureDeclaration;
  auditShape(context, checker, declaration, node);
  enforceIsPrefix(context, checker, declaration, node);
}

function reportUnlessExcepted(
  context: Context,
  node: TSESTree.MethodDefinition,
  violated: boolean,
): void {
  if (violated) {
    flagViolation(context, node, 'noGetterSetter');
  }
}

function makeListener(context: Context, services: Services) {
  const { program, esTreeNodeToTSNodeMap } = services;
  const checker = program.getTypeChecker();
  return (node: TSESTree.MethodDefinition): void =>
    checkMethod(context, checker, esTreeNodeToTSNodeMap, node);
}

/**
 * Do not use getters and setters (Law of Demeter). Forbid encapsulation via syntactic get/set accessors and
 * methods named getXxx / setXxx.
 * Boolean fields (getter returns boolean / setter's first parameter is boolean) are an exception.
 * Queries returning boolean (methods, module functions, callable fields such as signals) must start with is
 */
export const noGetterSetter = createRule<[], MessageIds>({
  name: 'no-getter-setter',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbids getters / setters and requires moving behavior into the object (boolean fields are an exception).',
      requiresTypeChecking: true,
    },
    messages: {
      noGetterSetter:
        'Do not use getters / setters. Instead of extracting data and manipulating it outside, move the behavior into the object (Law of Demeter; do not use getters or setters). Only boolean fields are an exception',
      boolNeedsIs: 'A query returning boolean must start with is (isXxx)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    return {
      MethodDefinition: makeListener(context, services),
      FunctionDeclaration: observeDeclarations(context, services),
      PropertyDefinition: watchFields(context, services),
    };
  },
});
