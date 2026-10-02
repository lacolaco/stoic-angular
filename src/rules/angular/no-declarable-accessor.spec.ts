import { RuleTester } from '@typescript-eslint/rule-tester';
import { Linter } from 'eslint';
import { afterAll, describe, expect, it } from 'vitest';
import { noDeclarableAccessor } from './no-declarable-accessor';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

type Kind = 'component' | 'directive' | 'pipe';

const DECORATORS: Record<Kind, { name: string; args: string }> = {
  component: { name: 'Component', args: "{ template: '' }" },
  directive: { name: 'Directive', args: "{ selector: '[x]' }" },
  pipe: { name: 'Pipe', args: "{ name: 'x' }" },
};

const KINDS = Object.keys(DECORATORS) as Kind[];

function declarable(kind: Kind, body: string, importSource = '@angular/core'): string {
  const { name, args } = DECORATORS[kind];
  return `import { ${name} } from '${importSource}';
@${name}(${args})
export class Target {
${body}
}`;
}

const GETTER = '  get total(): number {\n    return 1;\n  }';

tester.run('no-declarable-accessor', noDeclarableAccessor, {
  valid: [
    ...KINDS.flatMap((kind) => [
      {
        name: `${kind}: methods and fields are not reported`,
        code: declarable(
          kind,
          `  readonly label = 'a';
  private count = 0;
  #hidden = 1;
  static shared = 2;
  close(): void {}
  private tally(): number {
    return 1;
  }
  constructor() {}`,
        ),
      },
      {
        name: `${kind}: a method named like an accessor is not reported`,
        code: declarable(
          kind,
          `  getValue(): number {
    return 1;
  }
  setValue(_: number): void {}`,
        ),
      },
      {
        name: `${kind}: a decorator imported from another module is not Angular's`,
        code: declarable(kind, GETTER, './my-framework'),
      },
    ]),
    {
      name: 'accessors in a class without a decorator are allowed',
      code: `class Plain {\n${GETTER}\n}`,
    },
    {
      name: 'accessors in a class with another decorator are allowed',
      code: `import { Injectable } from '@angular/core';
@Injectable()
export class Store {
${GETTER}
}`,
    },
    {
      name: "a locally defined Component is not Angular's",
      code: `function Component(_: object): ClassDecorator {
  return () => {};
}
@Component({ template: '' })
export class Panel {
${GETTER}
}`,
    },
    {
      name: 'a file that does not import @angular/core is out of scope',
      code: `@Component({ template: '' })\nexport class Panel {\n${GETTER}\n}`,
    },
    {
      name: 'a class expression is out of scope',
      code: `import { Component } from '@angular/core';
export const Panel = @Component({ template: '' }) class {
${GETTER}
};`,
    },
    {
      name: 'with { allowPipe: true } a pipe is not checked',
      code: declarable('pipe', GETTER),
      options: [{ allowPipe: true }],
    },
    {
      name: 'with { allowComponent: true } a component is not checked',
      code: declarable('component', GETTER),
      options: [{ allowComponent: true }],
    },
    {
      name: 'with { allowDirective: true } a directive is not checked',
      code: declarable('directive', GETTER),
      options: [{ allowDirective: true }],
    },
  ],
  invalid: [
    ...KINDS.flatMap((kind) => [
      {
        name: `${kind}: a getter is reported`,
        code: declarable(kind, GETTER),
        errors: [{ messageId: 'accessor' as const, data: { kind }, line: 4 }],
      },
      {
        name: `${kind}: a setter is reported`,
        code: declarable(kind, '  set total(_: number) {}'),
        errors: [{ messageId: 'accessor' as const, data: { kind } }],
      },
      {
        name: `${kind}: a getter and a setter pair is reported twice`,
        code: declarable(kind, `${GETTER}\n  set total(_: number) {}`),
        errors: [
          { messageId: 'accessor' as const, data: { kind } },
          { messageId: 'accessor' as const, data: { kind } },
        ],
      },
      {
        name: `without options a ${kind} is checked`,
        code: declarable(kind, GETTER),
        options: [{}] as [object],
        errors: [{ messageId: 'accessor' as const, data: { kind } }],
      },
    ]),
    ...(['public', 'protected', 'private'] as const).map((modifier) => ({
      name: `a ${modifier} accessor is reported`,
      code: declarable('component', `  ${modifier} get total(): number {\n    return 1;\n  }`),
      errors: [{ messageId: 'accessor' as const, data: { kind: 'component' } }],
    })),
    {
      name: 'a static accessor is reported',
      code: declarable('component', '  static get total(): number {\n    return 1;\n  }'),
      errors: [{ messageId: 'accessor' }],
    },
    {
      name: 'a #private accessor is reported',
      code: declarable('component', '  get #total(): number {\n    return 1;\n  }'),
      errors: [{ messageId: 'accessor' }],
    },
    {
      name: 'an @Input() setter is reported',
      code: `import { Component, Input } from '@angular/core';
@Component({ template: '' })
export class Panel {
  @Input() set value(_: number) {}
}`,
      errors: [{ messageId: 'accessor', data: { kind: 'component' } }],
    },
    {
      name: 'an aliased import is followed',
      code: `import { Component as C } from '@angular/core';
@C({ template: '' })
export class Panel {
${GETTER}
}`,
      errors: [{ messageId: 'accessor' }],
    },
    {
      name: 'a namespace import is followed',
      code: `import * as ng from '@angular/core';
@ng.Component({ template: '' })
export class Panel {
${GETTER}
}`,
      errors: [{ messageId: 'accessor' }],
    },
    {
      name: 'only the accessor is reported among other members',
      code: declarable('component', `  a(): void {}\n  b = 1;\n${GETTER}`),
      errors: [{ messageId: 'accessor', line: 6 }],
    },
    {
      name: 'with { allowPipe: true } a component is checked',
      code: declarable('component', GETTER),
      options: [{ allowPipe: true }],
      errors: [{ messageId: 'accessor', data: { kind: 'component' } }],
    },
    {
      name: 'with { allowPipe: true } a directive is checked',
      code: declarable('directive', GETTER),
      options: [{ allowPipe: true }],
      errors: [{ messageId: 'accessor', data: { kind: 'directive' } }],
    },
    {
      name: 'with { allowComponent: true, allowDirective: true } a pipe is checked',
      code: declarable('pipe', GETTER),
      options: [{ allowComponent: true, allowDirective: true }],
      errors: [{ messageId: 'accessor', data: { kind: 'pipe' } }],
    },
  ],
});

describe('option schema', () => {
  // ESLint validates the options of a rule against its schema and throws on a violation
  function lintWith(option: unknown): void {
    new Linter().verify('', [
      {
        plugins: { x: { rules: { rule: noDeclarableAccessor as never } } },
        rules: { 'x/rule': ['error', option] as never },
      },
    ]);
  }

  it.each([[{}], [{ allowPipe: true }], [{ allowComponent: true, allowDirective: false, allowPipe: true }]])(
    'accepts %j',
    (option) => {
      expect(() => lintWith(option)).not.toThrow();
    },
  );

  it.each([[{ pipe: true }], [{ service: true }], [{ allowPipe: 'yes' }], [{ allowPipe: 1 }], [['allowPipe']]])(
    'rejects %j',
    (option) => {
      expect(() => lintWith(option)).toThrow(/Key "x\/rule"/);
    },
  );
});
