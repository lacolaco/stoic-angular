import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noDirectivePrivateMethod } from './no-directive-private-method';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-directive-private-method', noDirectivePrivateMethod, {
  valid: [
    {
      name: 'protected methods are allowed',
      code: `import { Directive } from '@angular/core';
@Directive({ name: 'x' })
export class Highlight {
  protected close(): void {}
}`,
    },
    {
      name: "private methods in a @Component class are not this rule's concern",
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
    },
    {
      name: "a Directive imported from another module is not Angular's",
      code: `import { Directive } from './my-framework';
@Directive({ name: 'x' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'private methods are reported',
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
      name: 'private arrow function fields are reported',
      code: `import { Directive } from '@angular/core';
@Directive({ name: 'x' })
export class Highlight {
  private readonly tally = (): number => 1;
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'an aliased import is followed',
      code: `import { Directive as D } from '@angular/core';
@D({ name: 'x' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
  ],
});
