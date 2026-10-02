import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { ifOnlyAtStart } from './if-only-at-start';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('if-only-at-start', ifOnlyAtStart, {
  valid: [
    {
      name: 'code after the fix: the if is the only statement of the function',
      code: `declare function isPrime(n: number): boolean; declare function log(n: number): void;
function reportIfPrime(n: number) {
  if (isPrime(n)) {
    log(n);
  }
}`,
    },
    {
      name: 'an else / else-if chain is allowed as part of the leading if',
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
    },
    {
      name: 'a function without if may have any number of statements',
      code: `declare function f(): number; declare function g(n: number): void;
function run() {
  const n = f();
  g(n);
}`,
    },
    {
      name: 'a nested function is its own unit (a sole leading if in a callback is allowed)',
      code: `declare function each(cb: (n: number) => void): void; declare function g(n: number): void;
function run() {
  each((n) => {
    if (n > 0) {
      g(n);
    }
  });
}`,
    },
    {
      name: 'an if outside a function (module level) is out of scope',
      code: `declare const x: boolean; declare function f(): void;
if (x) {
  f();
}`,
    },
    {
      name: 'an if outside a function (class static block) is out of scope',
      code: `declare const x: boolean; declare function f(): void;
class C {
  static {
    if (x) {
      f();
    }
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'prohibited example: an if inside a loop',
      code: `declare function isPrime(n: number): boolean; declare function log(n: number): void;
function reportPrimes(n: number) {
  for (let i = 2; i < n; i++) {
    if (isPrime(i)) {
      log(i);
    }
  }
}`,
      errors: [{ messageId: 'notAtStart' }],
    },
    {
      name: 'an if after another statement',
      code: `declare function f(): number; declare function g(): void;
function run() {
  const n = f();
  if (n > 0) {
    g();
  }
}`,
      errors: [{ messageId: 'notAtStart' }],
    },
    {
      name: 'a function with statements after a leading if (a function with an if does nothing else)',
      code: `declare function g(): void; declare function h(): void;
function run(flag: boolean) {
  if (flag) {
    g();
  }
  h();
}`,
      errors: [{ messageId: 'notAtStart' }],
    },
    {
      name: 'an if inside an if (nesting that is not else-if)',
      code: `declare function g(): void;
function run(a: boolean, b: boolean) {
  if (a) {
    if (b) {
      g();
    }
  }
}`,
      errors: [{ messageId: 'notAtStart' }],
    },
  ],
});
