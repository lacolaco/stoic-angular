import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { isAngularCoreDecorator } from './angular-imports.js';
import { createRule } from './create-rule.js';

type MessageIds = 'privateMethod';

export interface PrivateMethodRuleSpec {
  /** Rule name, which is also the name of its doc file */
  name: string;
  /** Name of the `@angular/core` decorator that marks the target classes */
  decorator: string;
  description: string;
  message: string;
}

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

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

function isTarget(context: Context, cls: TSESTree.ClassDeclaration, decorator: string): boolean {
  const { ast } = context.sourceCode;
  return cls.decorators.some((node) => isAngularCoreDecorator(ast, node, decorator));
}

function audit(context: Context, cls: TSESTree.ClassDeclaration, decorator: string): void {
  const members = isTarget(context, cls, decorator) ? cls.body.body : [];
  members.filter(isBuried).forEach((node) => context.report({ node, messageId: 'privateMethod' }));
}

/**
 * Builds a rule that forbids private methods in classes decorated with the given
 * `@angular/core` decorator (judged by the file's imports). The rules for components,
 * directives and pipes differ only in the decorator and the texts
 */
export function createPrivateMethodRule(spec: PrivateMethodRuleSpec) {
  const { name, decorator, description, message } = spec;
  return createRule<[], MessageIds>({
    name,
    meta: {
      type: 'suggestion',
      docs: { description },
      messages: { privateMethod: message },
      schema: [],
    },
    defaultOptions: [],
    create(context) {
      return { ClassDeclaration: (node) => audit(context, node, decorator) };
    },
  });
}
