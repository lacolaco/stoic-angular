import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noSwitch } from './no-switch';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-switch', noSwitch, {
  valid: [
    {
      name: 'a switch without default where every case returns is allowed',
      code: `type Kind = 'a' | 'b';
function label(kind: Kind): string {
  switch (kind) {
    case 'a':
      return 'A';
    case 'b':
      return 'B';
  }
}`,
    },
    {
      name: 'cases grouped by fallthrough are allowed if the last case returns',
      code: `type Kind = 'a' | 'b' | 'c';
function label(kind: Kind): string {
  switch (kind) {
    case 'a':
    case 'b':
      return 'AB';
    case 'c':
      return 'C';
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'a default clause is prohibited',
      code: `function label(kind: string): string {
  switch (kind) {
    case 'a':
      return 'A';
    default:
      return 'other';
  }
}`,
      errors: [{ messageId: 'noDefault' }],
    },
    {
      name: 'a case that does not end with return is prohibited (break)',
      code: `declare function log(s: string): void;
function report(kind: 'a' | 'b'): void {
  switch (kind) {
    case 'a':
      log('A');
      break;
    case 'b':
      log('B');
      break;
  }
}`,
      errors: [{ messageId: 'caseMustReturn' }, { messageId: 'caseMustReturn' }],
    },
    {
      name: 'a trailing empty case is prohibited because it never reaches return',
      code: `function label(kind: 'a' | 'b'): string | undefined {
  switch (kind) {
    case 'a':
      return 'A';
    case 'b':
  }
  return undefined;
}`,
      errors: [{ messageId: 'caseMustReturn' }],
    },
  ],
});
