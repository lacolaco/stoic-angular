import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noClassInheritance } from './no-class-inheritance';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-class-inheritance', noClassInheritance, {
  valid: [
    {
      name: 'Implementing an interface (implements) is allowed',
      code: `interface Runner {
  run(): void;
}
class TaskRunner implements Runner {
  run(): void {}
}`,
    },
    {
      name: 'Inheritance between interfaces is allowed',
      code: `interface Base {
  id: string;
}
interface Extended extends Base {
  name: string;
}`,
    },
    {
      name: 'Classes without inheritance are allowed',
      code: `class Standalone {
  value = 1;
}`,
    },
  ],
  invalid: [
    {
      name: 'Inheriting from a class is forbidden',
      code: `class Base {
  value = 1;
}
class Derived extends Base {}`,
      errors: [{ messageId: 'noExtends' }],
    },
    {
      name: 'Inheriting from an abstract class is also forbidden',
      code: `abstract class Base {
  abstract run(): void;
}
class Derived extends Base {
  run(): void {}
}`,
      errors: [{ messageId: 'noExtends' }],
    },
    {
      name: 'Inheritance in a class expression is also forbidden',
      code: `class Base {}
const derived = class extends Base {};`,
      errors: [{ messageId: 'noExtends' }],
    },
  ],
});
