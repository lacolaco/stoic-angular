import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noGetterSetter } from './no-getter-setter';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['*.ts'] },
      tsconfigRootDir: __dirname,
    },
  },
});

tester.run('no-getter-setter', noGetterSetter, {
  valid: [
    {
      name: 'Methods with behavior are allowed',
      code: `export class Cart {
  private items: string[] = [];
  addItem(item: string): void {
    this.items.push(item);
  }
}`,
    },
    {
      name: 'A get accessor for a boolean field is allowed as an exception',
      code: `export class Door {
  private opened = false;
  get isOpen(): boolean {
    return this.opened;
  }
}`,
    },
    {
      name: 'A setXxx method handling boolean is allowed as an exception',
      code: `export class Door {
  private opened = false;
  setOpen(open: boolean): void {
    this.opened = open;
  }
}`,
    },
    {
      name: 'Similar names not starting with get (such as getterLike) are out of scope',
      code: `export class Box {
  getterLike(): number {
    return 1;
  }
}`,
    },
    {
      name: 'Boolean query methods starting with is are allowed',
      code: `export class Door {
  private opened = false;
  isOpen(): boolean {
    return this.opened;
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'Fields holding a signal returning boolean must start with is',
      code: `import { signal } from '@angular/core';
export class Panel {
  readonly opened = signal(false);
}`,
      errors: [{ messageId: 'boolNeedsIs' }],
    },
    {
      name: 'Syntactic get accessors are forbidden',
      code: `export class Box {
  private width = 1;
  get size(): number {
    return this.width;
  }
}`,
      errors: [{ messageId: 'noGetterSetter' }],
    },
    {
      name: 'Syntactic set accessors are forbidden',
      code: `export class Box {
  private width = 1;
  set size(value: number) {
    this.width = value;
  }
}`,
      errors: [{ messageId: 'noGetterSetter' }],
    },
    {
      name: 'Encapsulation via getXxx methods is also forbidden',
      code: `export class Box {
  private width = 1;
  getWidth(): number {
    return this.width;
  }
}`,
      errors: [{ messageId: 'noGetterSetter' }],
    },
    {
      name: 'Encapsulation via setXxx methods is also forbidden',
      code: `export class Box {
  private width = 1;
  setWidth(value: number): void {
    this.width = value;
  }
}`,
      errors: [{ messageId: 'noGetterSetter' }],
    },
    {
      name: 'A get accessor returning boolean that does not start with is is forbidden',
      code: `export class Door {
  private state = false;
  get open(): boolean {
    return this.state;
  }
}`,
      errors: [{ messageId: 'boolNeedsIs' }],
    },
    {
      name: 'A query method returning boolean that does not start with is is forbidden',
      code: `export class Cache {
  private readonly keys = new Set<string>();
  has(key: string): boolean {
    return this.keys.has(key);
  }
}`,
      errors: [{ messageId: 'boolNeedsIs' }],
    },
    {
      name: 'A getXxx method returning boolean is forbidden because it does not start with is',
      code: `export class Door {
  private state = false;
  getOpen(): boolean {
    return this.state;
  }
}`,
      errors: [{ messageId: 'boolNeedsIs' }],
    },
    {
      name: 'A module function returning boolean is also forbidden because it does not start with is',
      code: `export function vacant(items: readonly string[]): boolean {
  return items.length === 0;
}`,
      errors: [{ messageId: 'boolNeedsIs' }],
    },
  ],
});
