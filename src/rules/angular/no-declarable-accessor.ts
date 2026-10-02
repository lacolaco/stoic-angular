import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../../support/create-rule.js';
import {
  type AllowOptions,
  allowOptionsSchema,
  declarableKindOf,
  defaultAllowOptions,
} from '../../support/declarables.js';

type MessageIds = 'accessor';
type Options = [AllowOptions?];
type Context = TSESLint.RuleContext<MessageIds, Options>;

function isAccessor(member: TSESTree.ClassElement): member is TSESTree.MethodDefinition {
  return member.type === 'MethodDefinition' && (member.kind === 'get' || member.kind === 'set');
}

function audit(context: Context, options: AllowOptions, cls: TSESTree.ClassDeclaration): void {
  const kind = declarableKindOf(context.sourceCode, options, cls);
  const members = kind === undefined ? [] : cls.body.body;
  members
    .filter(isAccessor)
    .forEach((node) => context.report({ node, messageId: 'accessor', data: { kind } }));
}

/** Forbids getters and setters in classes decorated with `@Component`, `@Directive` or `@Pipe` */
export const noDeclarableAccessor = createRule<Options, MessageIds>({
  name: 'no-declarable-accessor',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbids getters and setters in Angular components, directives and pipes and requires signals, signal inputs or methods instead.',
    },
    messages: {
      accessor:
        'Do not define a getter or a setter in a {{kind}}. Expose a value as a signal, a computed or a method, and declare an input with a signal input',
    },
    schema: [allowOptionsSchema],
  },
  defaultOptions: [defaultAllowOptions],
  create(context, [options]) {
    return { ClassDeclaration: (node) => audit(context, options ?? {}, node) };
  },
});
