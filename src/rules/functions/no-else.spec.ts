import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noElse } from './no-else';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-else', noElse, {
  valid: [
    {
      name: 'an if without else is allowed',
      code: `declare function f(): void;
function run(flag: boolean) {
  if (flag) {
    f();
  }
}`,
    },
    {
      name: 'the conditional operator is out of scope',
      code: `function pick(flag: boolean): number {
  return flag ? 1 : 2;
}`,
    },
    {
      name: 'checks of external data types can be excluded with a disable comment stating the reason',
      code: `declare function a(): void; declare function b(): void;
function dispatch(input: string) {
  // eslint-disable-next-line @rule-tester/no-else -- check of external data type (user input)
  if (input === 'a') {
    a();
  } else {
    b();
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'reports the combination of if and else',
      code: `declare function f(): void; declare function g(): void;
function run(flag: boolean) {
  if (flag) {
    f();
  } else {
    g();
  }
}`,
      errors: [{ messageId: 'noElse' }],
    },
    {
      name: 'reports an else if chain as a use of else',
      code: `declare function f(): void; declare function g(): void; declare function h(): void;
function dispatch(kind: string) {
  if (kind === 'a') {
    f();
  } else if (kind === 'b') {
    g();
  } else {
    h();
  }
}`,
      errors: [{ messageId: 'noElse' }, { messageId: 'noElse' }],
    },
  ],
});
