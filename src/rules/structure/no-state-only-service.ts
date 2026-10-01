import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { fromCore, isDecorated } from '../../support/angular-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'stateOnly' | 'globalState' | 'vmShape';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type Services = ParserServicesWithTypeInformation;

/** Initializers that require operations. resource runs by itself and needs none */
const MUTABLE: readonly string[] = ['signal', 'linkedSignal'];

function propValue(member: TSESTree.ClassElement): TSESTree.Node | undefined {
  return member.type === 'PropertyDefinition' ? (member.value ?? undefined) : undefined;
}

/** Names of the property initializers that are calls to @angular/core */
function reactives(services: Services, cls: TSESTree.ClassDeclaration): readonly string[] {
  const values = cls.body.body.map((member) => propValue(member));
  const names = values.map((v) => (v === undefined ? undefined : fromCore(services, v)));
  return names.filter((name): name is string => name !== undefined);
}

/** Whether it has at least one public method (operation) */
function isOperative(cls: TSESTree.ClassDeclaration): boolean {
  return cls.body.body.some(
    (m) => m.type === 'MethodDefinition' && m.kind === 'method' && m.accessibility !== 'private',
  );
}

function isProvidedIn(decorator: TSESTree.Decorator): boolean {
  const call = decorator.expression.type === 'CallExpression' ? decorator.expression : undefined;
  const arg = call?.arguments[0];
  const props = arg?.type === 'ObjectExpression' ? arg.properties : [];
  return props.some(
    (p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'providedIn',
  );
}

/** @Injectable({providedIn}) is global, not locally provided */
function isRooted(cls: TSESTree.ClassDeclaration): boolean {
  return cls.decorators.some((decorator) => isProvidedIn(decorator));
}

function scoped(service: boolean, local: boolean, rooted: boolean): boolean | undefined {
  return service || (local && rooted) ? true : local ? false : undefined;
}

/** true = global (@Service / @Injectable with providedIn), false = local, undefined = out of scope */
function classify(services: Services, cls: TSESTree.ClassDeclaration): boolean | undefined {
  const service = isDecorated(services, cls, 'Service');
  const local = !service && isDecorated(services, cls, 'Injectable');
  return scoped(service, local, isRooted(cls));
}

function isTitled(cls: TSESTree.ClassDeclaration): boolean {
  const { name } = cls.id ?? { name: '' };
  return name.endsWith('State');
}

/** A local (@Injectable) is a view model: put XxxViewModel in *.vm.ts */
function isShapedVm(cls: TSESTree.ClassDeclaration, filename: string): boolean {
  const { name } = cls.id ?? { name: '' };
  return name.endsWith('ViewModel') && filename.endsWith('.vm.ts');
}

function onGlobal(idle: boolean, titled: boolean): MessageIds | undefined {
  return titled ? 'globalState' : idle ? 'stateOnly' : undefined;
}

function verdict(
  services: Services,
  cls: TSESTree.ClassDeclaration,
  filename: string,
  global: boolean,
): MessageIds | undefined {
  const found = reactives(services, cls);
  const idle = found.some((name) => MUTABLE.includes(name)) && !isOperative(cls);
  return global ? onGlobal(idle, isTitled(cls)) : isShapedVm(cls, filename) ? undefined : 'vmShape';
}

function audit(context: Context, services: Services, cls: TSESTree.ClassDeclaration): void {
  const { filename } = context;
  const global = classify(services, cls);
  const fault = global === undefined ? undefined : verdict(services, cls, filename, global);
  condemn(context, cls, fault);
}

function condemn(context: Context, node: TSESTree.Node, id: MessageIds | undefined): void {
  if (id !== undefined) {
    context.report({ node, messageId: id });
  }
}

/**
 * Enforces cohesion per unit of responsibility. Forbids state-only services (mutable state without operations) and
 * global State classes, and requires an @Injectable provided by a component to be placed
 * in *.vm.ts as the view model XxxViewModel in one-to-one correspondence
 */
export const noStateOnlyService = createRule<[], MessageIds>({
  name: 'no-state-only-service',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows state-only services, global State classes, and violations of the ViewModel placement convention.',
      requiresTypeChecking: true,
    },
    messages: {
      stateOnly: 'Do not make a service of state alone. Put the state and the logic that operates on it in the same unit of responsibility',
      globalState: 'Do not create a global State class. A domain service owns the state',
      vmShape: 'An @Injectable provided by a component goes in *.vm.ts as the corresponding XxxViewModel',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    return { ClassDeclaration: (node) => audit(context, services, node) };
  },
});
