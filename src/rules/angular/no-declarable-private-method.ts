import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { isAngularCoreDecorator } from '../../support/angular-imports.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'privateMethod';
type Kind = 'component' | 'directive' | 'pipe';
type AllowOptions = { allowComponent?: boolean; allowDirective?: boolean; allowPipe?: boolean };
type Options = [AllowOptions?];
type Context = TSESLint.RuleContext<MessageIds, Options>;
type Member = TSESTree.MethodDefinition | TSESTree.PropertyDefinition;

const DECORATORS: Record<Kind, string> = {
  component: 'Component',
  directive: 'Directive',
  pipe: 'Pipe',
};

const ALLOW_KEYS: Record<Kind, keyof AllowOptions> = {
  component: 'allowComponent',
  directive: 'allowDirective',
  pipe: 'allowPipe',
};

const KINDS = Object.keys(DECORATORS) as Kind[];

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

function kindOf(
  context: Context,
  options: AllowOptions,
  cls: TSESTree.ClassDeclaration,
): Kind | undefined {
  const { ast } = context.sourceCode;
  const targets = KINDS.filter((kind) => options[ALLOW_KEYS[kind]] !== true);
  return targets.find((kind) =>
    cls.decorators.some((node) => isAngularCoreDecorator(ast, node, DECORATORS[kind])),
  );
}

function audit(context: Context, options: AllowOptions, cls: TSESTree.ClassDeclaration): void {
  const kind = kindOf(context, options, cls);
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
    schema: [
      {
        type: 'object',
        properties: {
          allowComponent: { type: 'boolean' },
          allowDirective: { type: 'boolean' },
          allowPipe: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allowComponent: false, allowDirective: false, allowPipe: false }],
  create(context, [options]) {
    return { ClassDeclaration: (node) => audit(context, options ?? {}, node) };
  },
});
