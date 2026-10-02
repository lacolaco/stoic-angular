import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'noExtends';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type ClassNode = TSESTree.ClassDeclaration | TSESTree.ClassExpression;

function flagSuper(context: Context, superClass: TSESTree.Node): void {
  const { loc } = superClass;
  context.report({ loc, messageId: 'noExtends' });
}

function checkHeritage(context: Context, superClass: TSESTree.Node | null): void {
  if (superClass !== null) {
    flagSuper(context, superClass);
  }
}

/** Inherit only from interfaces. Forbid extends of classes (including abstract classes) */
export const noClassInheritance = createRule<[], MessageIds>({
  name: 'no-class-inheritance',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbids inheriting from classes and requires sharing implementation through delegation.',
    },
    messages: {
      noExtends:
        'Do not inherit from classes. Inherit only from interfaces and share implementation through delegation (only inherit from interfaces)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const listener = (node: ClassNode): void => {
      const { superClass } = node;
      checkHeritage(context, superClass);
    };
    return { ClassDeclaration: listener, ClassExpression: listener };
  },
});
