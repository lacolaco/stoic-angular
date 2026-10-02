import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noPipePrivateMethod } from './no-pipe-private-method';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-pipe-private-method', noPipePrivateMethod, {
  valid: [
    {
      name: 'protected methods are allowed',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  protected close(): void {}
}`,
    },
    {
      name: "private methods in a @Directive class are not this rule's concern",
      code: `import { Directive } from '@angular/core';
@Directive({ template: '' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: "a Pipe imported from another module is not Angular's",
      code: `import { Pipe } from './my-framework';
@Pipe({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'private methods are reported',
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
      name: 'private arrow function fields are reported',
      code: `import { Pipe } from '@angular/core';
@Pipe({ name: 'x' })
export class DoublePipe {
  private readonly tally = (): number => 1;
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'an aliased import is followed',
      code: `import { Pipe as D } from '@angular/core';
@D({ name: 'x' })
export class DoublePipe {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
  ],
});
