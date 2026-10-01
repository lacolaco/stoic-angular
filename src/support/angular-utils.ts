import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import type { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';
import { lookupSymbol, resolveAlias } from './ts-utils.js';

type Services = ParserServicesWithTypeInformation;

function calleeName(expression: TSESTree.Node): TSESTree.Node | undefined {
  const call = expression.type === 'CallExpression' ? expression : undefined;
  const callee = call?.callee;
  return callee?.type === 'MemberExpression' ? callee.property : callee;
}

function resolved(services: Services, node: TSESTree.Node): ts.Symbol | undefined {
  const { program, esTreeNodeToTSNodeMap } = services;
  const checker = program.getTypeChecker();
  const raw = lookupSymbol(checker, esTreeNodeToTSNodeMap.get(node));
  return raw === undefined ? undefined : resolveAlias(checker, raw);
}

/**
 * If a call-shaped expression is an export of @angular/core, returns its resolved name.
 * Aliased imports and namespace imports are tracked too
 */
export function fromCore(services: Services, expression: TSESTree.Node): string | undefined {
  const target = calleeName(expression);
  const symbol = target === undefined ? undefined : resolved(services, target);
  const { name } = symbol ?? { name: '' };
  return originOf(symbol).includes('@angular/core') ? name : undefined;
}

export function isDecorated(
  services: Services,
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  expected: string,
): boolean {
  return node.decorators.some((decorator) => fromCore(services, decorator.expression) === expected);
}

/** Gets the owning class from a class member (parent = ClassBody) */
export function enclosingClass(
  node: TSESTree.Node,
): TSESTree.ClassDeclaration | TSESTree.ClassExpression {
  return node.parent?.parent as TSESTree.ClassDeclaration | TSESTree.ClassExpression;
}

export function resolvedSymbol(services: Services, node: TSESTree.Node): ts.Symbol | undefined {
  return resolved(services, node);
}

export function originOf(symbol: ts.Symbol | undefined): string {
  return symbol?.declarations?.[0]?.getSourceFile().fileName ?? '';
}

export function isAngularComponent(
  services: Services,
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): boolean {
  return isDecorated(services, node, 'Component');
}
