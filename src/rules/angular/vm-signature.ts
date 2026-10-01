import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { enclosingClass } from '../../support/angular-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'querySignature' | 'commandSignature';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

/** Types allowed to be exposed as a query */
const QUERIES: readonly string[] = ['Signal', 'WritableSignal'];

function isModelClass(cls: TSESTree.ClassDeclaration | TSESTree.ClassExpression): boolean {
  const { id } = cls;
  return (id?.name ?? '').endsWith('ViewModel');
}

function isExempt(member: TSESTree.PropertyDefinition | TSESTree.MethodDefinition): boolean {
  return isHidden(member) || !isModelClass(enclosingClass(member));
}

function typeNameOf(annotation: TSESTree.TypeNode | undefined): string {
  const named = annotation?.type === 'TSTypeReference' ? annotation.typeName : undefined;
  return named?.type === 'Identifier' ? named.name : '';
}

function isQuery(annotation: TSESTree.TypeNode | undefined): boolean {
  return QUERIES.includes(typeNameOf(annotation));
}

function wrappedParams(annotation: TSESTree.TypeNode | undefined): readonly TSESTree.TypeNode[] {
  const wrapped = annotation?.type === 'TSTypeReference' ? annotation.typeArguments : undefined;
  const { params } = wrapped ?? { params: [] as TSESTree.TypeNode[] };
  return params;
}

function isSettledVoid(annotation: TSESTree.TypeNode | undefined): boolean {
  const params = wrappedParams(annotation);
  const sole = params.length === 1 ? params[0] : undefined;
  return typeNameOf(annotation) === 'Promise' && sole?.type === 'TSVoidKeyword';
}

function isCommand(annotation: TSESTree.TypeNode | undefined): boolean {
  const { type } = annotation ?? { type: '' };
  return type === 'TSVoidKeyword' || isSettledVoid(annotation);
}

function isHidden(member: TSESTree.PropertyDefinition | TSESTree.MethodDefinition): boolean {
  return member.accessibility === 'private' || member.key.type === 'PrivateIdentifier';
}

function onProp(context: Context, member: TSESTree.PropertyDefinition): void {
  const { typeAnnotation, readonly } = member;
  const annotation = typeAnnotation?.typeAnnotation;
  const passed = isExempt(member) || (readonly === true && isQuery(annotation));
  condemn(context, member, passed ? undefined : 'querySignature');
}

function onMethod(context: Context, member: TSESTree.MethodDefinition): void {
  const { value, kind } = member;
  const annotation = value.returnType?.typeAnnotation;
  const passed = kind !== 'method' || isExempt(member) || isCommand(annotation);
  condemn(context, member, passed ? undefined : 'commandSignature');
}

function condemn(context: Context, node: TSESTree.Node, id: MessageIds | undefined): void {
  if (id !== undefined) {
    context.report({ node, messageId: id });
  }
}

/**
 * Fixes the public signature of a view model to CQS. A query must be a property with an
 * explicit Signal / WritableSignal type, and a command must be a method with an
 * explicit void / Promise<void> type
 */
export const vmSignature = createRule<[], MessageIds>({
  name: 'vm-signature',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Restricts view model queries to readonly Signal properties and commands to void or Promise<void> methods.',
    },
    messages: {
      querySignature:
        'A view model query must be a readonly property with an explicit Signal / WritableSignal type (readonly is required)',
      commandSignature: 'A view model command must be a method with an explicit void or Promise<void> return type',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition: (node) => onProp(context, node),
      MethodDefinition: (node) => onMethod(context, node),
    };
  },
});
