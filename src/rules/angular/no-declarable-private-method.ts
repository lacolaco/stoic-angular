import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';
import {
  type AllowOptions,
  allowOptionsSchema,
  declarableKindOf,
  defaultAllowOptions,
} from '../../support/declarables.js';

type MessageIds = 'privateMethod';
type Options = [AllowOptions?];
type Context = TSESLint.RuleContext<MessageIds, Options>;
type Member = TSESTree.MethodDefinition | TSESTree.PropertyDefinition;

function isHidden(member: Member): boolean {
  const { accessibility, key } = member;
  return accessibility === 'private' || key.type === 'PrivateIdentifier';
}

/** Whether this is a method or an accessor; function-valued fields are allowed */
function isBehavioral(member: Member): boolean {
  return member.type === 'MethodDefinition' && member.kind !== 'constructor';
}

function isBuried(member: TSESTree.ClassElement): boolean {
  const { type } = member;
  const scoped = type === 'MethodDefinition' || type === 'PropertyDefinition';
  return scoped && isHidden(member as Member) && isBehavioral(member as Member);
}

function audit(context: Context, options: AllowOptions, cls: TSESTree.ClassDeclaration): void {
  const kind = declarableKindOf(context.sourceCode, options, cls);
  const members = kind === undefined ? [] : cls.body.body;
  members
    .filter(isBuried)
    .forEach((node) => context.report({ node, messageId: 'privateMethod', data: { kind } }));
}

/** Forbids private methods in classes decorated with `@Component`, `@Directive` or `@Pipe` */
export const noDeclarablePrivateMethod = createRule<Options, MessageIds>({
  name: 'no-declarable-private-method',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbids private methods in Angular components, directives and pipes and requires moving the logic to collaborating objects.',
    },
    messages: {
      privateMethod:
        'Do not put private methods in a {{kind}}. Move the logic to a collaborating object such as a service or a function',
    },
    schema: [allowOptionsSchema],
  },
  defaultOptions: [defaultAllowOptions],
  create(context, [options]) {
    return { ClassDeclaration: (node) => audit(context, options ?? {}, node) };
  },
});
