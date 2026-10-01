import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { fromCore, isAngularComponent, originOf, resolvedSymbol } from '../../support/angular-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'foreignInject' | 'mixedRole' | 'privateMethod';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type Services = ParserServicesWithTypeInformation;

/** Marker of input/output-driven (plain) components */
const IO: readonly string[] = ['input', 'output', 'model'];

type Member = TSESTree.MethodDefinition | TSESTree.PropertyDefinition;

function isHidden(member: Member): boolean {
  const { accessibility, key } = member;
  return accessibility === 'private' || key.type === 'PrivateIdentifier';
}

/** Whether this is a method, or a function field (such as an arrow function) that behaves as one */
function isBehavioral(member: Member): boolean {
  const { value } = member;
  const fn = value?.type === 'ArrowFunctionExpression' || value?.type === 'FunctionExpression';
  return member.type === 'MethodDefinition' ? member.kind !== 'constructor' : fn;
}

function isBuried(member: TSESTree.ClassElement): boolean {
  const { type } = member;
  const scoped = type === 'MethodDefinition' || type === 'PropertyDefinition';
  return scoped && isHidden(member as Member) && isBehavioral(member as Member);
}

function propCall(member: TSESTree.ClassElement): TSESTree.CallExpression | undefined {
  const value = member.type === 'PropertyDefinition' ? member.value : null;
  return value?.type === 'CallExpression' ? value : undefined;
}

function injectedToken(
  services: Services,
  member: TSESTree.ClassElement,
): TSESTree.Node | undefined {
  const call = propCall(member);
  const target = call === undefined ? undefined : fromCore(services, call);
  const { arguments: args } = call ?? { arguments: [] as TSESTree.CallExpressionArgument[] };
  return target === 'inject' ? args[0] : undefined;
}

function isIo(services: Services, member: TSESTree.ClassElement): boolean {
  const call = propCall(member);
  return call !== undefined && IO.includes(fromCore(services, call) ?? '');
}

/** Whether this is a project-defined token that is not its own XxxViewModel */
function isForeign(services: Services, target: TSESTree.Node, owner: string): boolean {
  const symbol = resolvedSymbol(services, target);
  const { name } = symbol ?? { name: '' };
  const origin = originOf(symbol);
  return origin !== '' && !origin.includes('node_modules') && name !== `${owner}ViewModel`;
}

function isModelInject(services: Services, member: TSESTree.ClassElement): boolean {
  const target = injectedToken(services, member);
  const symbol = target === undefined ? undefined : resolvedSymbol(services, target);
  const { name } = symbol ?? { name: '' };
  return name.endsWith('ViewModel');
}

function ownerName(cls: TSESTree.ClassDeclaration): string {
  const { id } = cls;
  return id?.name ?? '';
}

function vet(context: Context, services: Services, member: TSESTree.ClassElement, owner: string) {
  const target = injectedToken(services, member);
  const foreign = target !== undefined && isForeign(services, target, owner);
  const fault = foreign ? 'foreignInject' : isBuried(member) ? 'privateMethod' : undefined;
  condemn(context, member, fault as MessageIds | undefined);
}

function isMixed(services: Services, members: readonly TSESTree.ClassElement[]): boolean {
  return members.some((m) => isIo(services, m)) && members.some((m) => isModelInject(services, m));
}

function vetAll(
  context: Context,
  services: Services,
  members: readonly TSESTree.ClassElement[],
  owner: string,
): void {
  members.forEach((member) => vet(context, services, member, owner));
}

function audit(context: Context, services: Services, cls: TSESTree.ClassDeclaration): void {
  const { body } = cls;
  const members = isAngularComponent(services, cls) ? body.body : [];
  vetAll(context, services, members, ownerName(cls));
  condemn(context, cls, isMixed(services, members) ? 'mixedRole' : undefined);
}

function condemn(context: Context, node: TSESTree.Node, id: MessageIds | undefined): void {
  if (id !== undefined) {
    context.report({ node, messageId: id });
  }
}

/**
 * Constrains the shape of a component. Injection is limited to the 1-1 view model
 * (framework infrastructure such as ElementRef is an exception), a plain
 * input/output-driven component has no view model, and it has no private methods
 * (logic goes to the VM or collaborating objects)
 */
export const componentSignature = createRule<[], MessageIds>({
  name: 'component-signature',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Restricts the signature of Angular components (inject only their own ViewModel, no mixing with input/output, no private methods).',
      requiresTypeChecking: true,
    },
    messages: {
      foreignInject:
        'A component may inject only the XxxViewModel in 1-1 correspondence with itself (framework infrastructure excluded) (Only inject own view model)',
      mixedRole: 'A component that uses input/output has no view model (stay plain)',
      privateMethod:
        'Do not put private methods in a component. Move the logic to the view model or a collaborating object',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    return { ClassDeclaration: (node) => audit(context, services, node) };
  },
});
