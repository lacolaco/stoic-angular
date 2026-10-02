import { RuleTester } from '@typescript-eslint/rule-tester';
import { Linter } from 'eslint';
import { afterAll, describe, expect, it } from 'vitest';
import { noDeclarablePrivateMethod } from './no-declarable-private-method';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-declarable-private-method', noDeclarablePrivateMethod, {
  valid: [
    {
      name: 'private arrow function fields are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly tally = (): number => 1;
}`,
    },
    {
      name: 'private function expression fields are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly tally = function (): number {
    return 1;
  };
}`,
    },
    {
      name: '#private arrow function fields are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  readonly #tally = (): number => 1;
}`,
    },
    {
      name: 'directive: private arrow function fields are allowed',
      code: `import { Directive } from '@angular/core';
@Directive({ name: 'x' })
export class Highlight {
  private readonly tally = (): number => 1;
}`,
    },
    {
      name: 'pipe: private arrow function fields are allowed',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private readonly tally = (): number => 1;
}`,
    },
    {
      name: 'protected methods are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  protected close(): void {}
}`,
    },
    {
      name: 'public methods are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  close(): void {}
}`,
    },
    {
      name: 'constructor is not a method (private constructor too)',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private constructor() {}
}`,
    },
    {
      name: 'private fields holding non-function values are allowed',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly label = 'a';
  #count = 0;
  private readonly tick = signal(0);
}`,
    },
    {
      name: 'private methods in a class without a decorator are allowed',
      code: `class Plain {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'private methods in a class with another decorator are allowed',
      code: `import { Injectable } from '@angular/core';
@Injectable()
export class Store {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: "a Component imported from another module is not Angular's",
      code: `import { Component } from './my-framework';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: "a locally defined Component is not Angular's",
      code: `function Component(_: object): ClassDecorator {
  return () => {};
}
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'a file that does not import @angular/core is out of scope',
      code: `@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'a type-only import cannot be the decorator',
      code: `import type { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'the bare decorator form is out of scope',
      code: `import { Component } from '@angular/core';
@Component
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: "a namespace import of another module is not Angular's",
      code: `import * as ng from './my-framework';
@ng.Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'an aliased import of an unrelated export is not a target',
      code: `import { Injectable as Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'a class expression is out of scope',
      code: `import { Component } from '@angular/core';
export const Panel = @Component({ template: '' }) class {
  private tally(): number {
    return 1;
  }
};`,
    },
    {
      name: 'directive: protected methods are allowed',
      code: `import { Directive } from '@angular/core';
@Directive({ name: 'x' })
export class Highlight {
  protected close(): void {}
}`,
    },
    {
      name: "directive: a Directive imported from another module is not Angular's",
      code: `import { Directive } from './my-framework';
@Directive({ name: 'x' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'pipe: protected methods are allowed',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  protected close(): void {}
}`,
    },
    {
      name: "pipe: a Pipe imported from another module is not Angular's",
      code: `import { Pipe } from './my-framework';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: 'with { allowPipe: true } a pipe is not checked',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: true }],
    },
    {
      name: 'with { allowComponent: true } a component is not checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowComponent: true }],
    },
    {
      name: 'with { allowDirective: true } a directive is not checked',
      code: `import { Directive } from '@angular/core';
@Directive({ selector: '[x]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowDirective: true }],
    },
    {
      name: 'with { allowComponent: true, allowDirective: true } a component is not checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowComponent: true, allowDirective: true }],
    },
    {
      name: 'with { allowComponent: true, allowDirective: true } a directive is not checked',
      code: `import { Directive } from '@angular/core';
@Directive({ selector: '[x]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowComponent: true, allowDirective: true }],
    },
  ],
  invalid: [
    {
      name: 'private methods are reported',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: '#private methods are reported',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  #tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'private accessors are reported',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private get total(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'an aliased import is followed',
      code: `import { Component as C } from '@angular/core';
@C({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'a namespace import is followed',
      code: `import * as ng from '@angular/core';
@ng.Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'the decorator is found among several',
      code: `import { Component } from '@angular/core';
import { Sealed } from './sealed';
@Sealed()
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'only the private method is reported, not the private function field',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private a(): void {}
  protected b(): void {}
  private c = () => {};
}`,
      errors: [{ messageId: 'privateMethod', line: 4 }],
    },
    {
      name: 'directive: private methods are reported',
      code: `import { Directive } from '@angular/core';
@Directive({ name: 'x' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'directive: an aliased import is followed',
      code: `import { Directive as D } from '@angular/core';
@D({ name: 'x' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'pipe: private methods are reported',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'pipe: an aliased import is followed',
      code: `import { Pipe as D } from '@angular/core';
@D({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'without options a component is checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod', data: { kind: 'component' } }],
    },
    {
      name: 'without options a directive is checked',
      code: `import { Directive } from '@angular/core';
@Directive({ selector: '[x]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod', data: { kind: 'directive' } }],
    },
    {
      name: 'without options a pipe is checked',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod', data: { kind: 'pipe' } }],
    },
    {
      name: 'with { allowPipe: true } a component is checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: true }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'component' } }],
    },
    {
      name: 'with { allowPipe: true } a directive is checked',
      code: `import { Directive } from '@angular/core';
@Directive({ selector: '[x]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: true }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'directive' } }],
    },
    {
      name: 'with { allowComponent: true, allowDirective: true } a pipe is checked',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowComponent: true, allowDirective: true }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'pipe' } }],
    },
    {
      name: 'with { allowPipe: false } a component is checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: false }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'component' } }],
    },
    {
      name: 'with { allowPipe: false } a directive is checked',
      code: `import { Directive } from '@angular/core';
@Directive({ selector: '[x]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: false }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'directive' } }],
    },
    {
      name: 'with { allowPipe: false } a pipe is checked',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      options: [{ allowPipe: false }],
      errors: [{ messageId: 'privateMethod', data: { kind: 'pipe' } }],
    },
    {
      name: 'with {} a component is checked',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}`,
      options: [{}],
      errors: [{ messageId: 'privateMethod', data: { kind: 'component' } }],
    },
    {
      name: 'with {} a pipe is checked',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      options: [{}],
      errors: [{ messageId: 'privateMethod', data: { kind: 'pipe' } }],
    },
  ],
});

describe('option schema', () => {
  // ESLint validates the options of a rule against its schema and throws on a violation
  function lintWith(option: unknown): void {
    new Linter().verify('', [
      {
        plugins: { x: { rules: { rule: noDeclarablePrivateMethod as never } } },
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
