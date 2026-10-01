import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { enclosingClass, isDecorated } from '../../support/angular-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'missingDoc';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type Services = ParserServicesWithTypeInformation;

type Member = TSESTree.MethodDefinition | TSESTree.PropertyDefinition;

function isHidden(member: Member): boolean {
  const { accessibility, key } = member;
  return accessibility === 'private' || key.type === 'PrivateIdentifier';
}

function isDocumented(context: Context, member: Member): boolean {
  const { sourceCode } = context;
  const comments = sourceCode.getCommentsBefore(member);
  return comments.some((c) => c.type === 'Block' && c.value.startsWith('*'));
}

function isProvided(services: Services, cls: ReturnType<typeof enclosingClass>): boolean {
  return isDecorated(services, cls, 'Service') || isDecorated(services, cls, 'Injectable');
}

function isExposed(services: Services, member: Member): boolean {
  return isProvided(services, enclosingClass(member)) && !isHidden(member);
}

function onMethod(context: Context, services: Services, member: TSESTree.MethodDefinition): void {
  const { kind } = member;
  const target = kind !== 'constructor' && isExposed(services, member);
  condemn(context, member, target && !isDocumented(context, member));
}

function onProp(context: Context, services: Services, member: TSESTree.PropertyDefinition): void {
  condemn(context, member, isExposed(services, member) && !isDocumented(context, member));
}

function condemn(context: Context, member: Member, violated: boolean): void {
  if (violated) {
    const { key } = member;
    context.report({ node: key, messageId: 'missingDoc' });
  }
}

/**
 * Requires JSDoc on non-private members of DI-provided classes (@Service / @Injectable).
 * The public surface must state its purpose
 */
export const injectableJsdoc = createRule<[], MessageIds>({
  name: 'injectable-jsdoc',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires JSDoc stating the purpose on public members of @Service / @Injectable classes.',
      requiresTypeChecking: true,
    },
    messages: {
      missingDoc: 'Document the purpose of public members of @Service / @Injectable with JSDoc',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    return {
      MethodDefinition: (node) => onMethod(context, services, node),
      PropertyDefinition: (node) => onProp(context, services, node),
    };
  },
});
