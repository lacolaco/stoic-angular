import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { isAngularCoreDecorator } from './angular-imports.js';

/** The kinds of Angular classes that a rule can target: components, directives and pipes */
export type DeclarableKind = 'component' | 'directive' | 'pipe';

/** The option shared by rules on declarables; a kind set to `true` is excluded from the check */
export type AllowOptions = {
  allowComponent?: boolean;
  allowDirective?: boolean;
  allowPipe?: boolean;
};

const DECORATORS: Record<DeclarableKind, string> = {
  component: 'Component',
  directive: 'Directive',
  pipe: 'Pipe',
};

const ALLOW_KEYS: Record<DeclarableKind, keyof AllowOptions> = {
  component: 'allowComponent',
  directive: 'allowDirective',
  pipe: 'allowPipe',
};

const KINDS = Object.keys(DECORATORS) as DeclarableKind[];

/** The JSON schema of {@link AllowOptions} */
export const allowOptionsSchema = {
  type: 'object',
  properties: {
    allowComponent: { type: 'boolean' },
    allowDirective: { type: 'boolean' },
    allowPipe: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

/** The default of {@link AllowOptions}: every kind is checked */
export const defaultAllowOptions: AllowOptions = {
  allowComponent: false,
  allowDirective: false,
  allowPipe: false,
};

/**
 * The kind of the class when it is decorated with a call of `@Component`, `@Directive` or `@Pipe`
 * from `@angular/core` and the kind is not allowed by the options; otherwise `undefined`.
 */
export function declarableKindOf(
  sourceCode: Readonly<TSESLint.SourceCode>,
  options: AllowOptions,
  cls: TSESTree.ClassDeclaration,
): DeclarableKind | undefined {
  const { ast } = sourceCode;
  const targets = KINDS.filter((kind) => options[ALLOW_KEYS[kind]] !== true);
  return targets.find((kind) =>
    cls.decorators.some((node) => isAngularCoreDecorator(ast, node, DECORATORS[kind])),
  );
}
