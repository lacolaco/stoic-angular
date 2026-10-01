import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { namedParamUnions } from './named-param-unions';

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

tester.run('named-param-unions', namedParamUnions, {
  valid: [
    {
      name: 'Named types are allowed',
      code: `import { Service } from '@angular/core';
export type Direction = -1 | 1;
@Service()
export class Zoom {
  stepBy(delta: Direction): void {
    void delta;
  }
}`,
    },
    {
      name: 'A single type is ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Breaks {
  toggle(blockId: string): void {
    void blockId;
  }
}`,
    },
    {
      name: 'private is ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  private clamp(delta: -1 | 1): void {
    void delta;
  }
}`,
    },
    {
      name: 'Classes that are neither view models nor services are ignored',
      code: `export class FontCatalog {
  next(delta: -1 | 1): void {
    void delta;
  }
}`,
    },
    {
      name: 'protected is not public either, so it is ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  protected clamp(delta: -1 | 1): void {
    void delta;
  }
}`,
    },
    {
      name: 'private constructor parameter properties are ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  constructor(private readonly mode: 'a' | 'b') {}
}`,
    },
    {
      name: 'A pair of true and false is ignored because boolean is its name',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  flag(on: true | false): void {
    void on;
  }
}`,
    },
    {
      name: 'A pair with undefined that only marks optionality is ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  select(step: number | undefined): void {
    void step;
  }
}`,
    },
    {
      name: 'A pair with null is ignored',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  select(step: number | null): void {
    void step;
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'Inline unions in public service methods are forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(delta: -1 | 1): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Inline unions in public view model methods are forbidden',
      code: `import { Injectable } from '@angular/core';
@Injectable()
export class ToolbarViewModel {
  stepBy(delta: -1 | 1): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'String literal unions are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Paper {
  orient(side: 'portrait' | 'landscape'): void {
    void side;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'With multiple parameters, each offending parameter is reported',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  move(delta: -1 | 1, axis: 'x' | 'y'): void {
    void delta;
    void axis;
  }
}`,
      errors: [{ messageId: 'namedUnion' }, { messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even with a default value',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(delta: -1 | 1 = 1): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even for rest parameters',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepAll(...deltas: (-1 | 1)[]): void {
    void deltas;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even when wrapped in parentheses',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(delta: (-1 | 1) | undefined): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Injectable with providedIn is also covered',
      code: `import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class Zoom {
  stepBy(delta: -1 | 1): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Unions inside object types are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(opts: { delta: -1 | 1 }): void {
    void opts;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Unions inside tuples are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(pair: [-1 | 1, number]): void {
    void pair;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Unions in function type parameters are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  watch(cb: (delta: -1 | 1) => void): void {
    void cb;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even when options are split by nested parentheses',
      code: `import { Service } from '@angular/core';
@Service()
export class Paper {
  orient(side: 'portrait' | ('landscape' | undefined)): void {
    void side;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even for arrow function properties',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  readonly stepBy = (delta: -1 | 1): void => {
    void delta;
  };
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Constructor parameters are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  constructor(delta: -1 | 1) {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Function-typed properties without an initializer are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  declare readonly stepBy: (delta: -1 | 1) => void;
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden even when written in a type parameter constraint',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  pick<T extends -1 | 1>(delta: T): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Public constructor parameter properties are forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  constructor(readonly mode: 'a' | 'b') {}
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'abstract members are also forbidden',
      code: `import { Service } from '@angular/core';
@Service()
export abstract class Zoom {
  abstract stepBy(delta: -1 | 1): void;
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
    {
      name: 'Forbidden if the rest is a union even when undefined is included',
      code: `import { Service } from '@angular/core';
@Service()
export class Zoom {
  stepBy(delta: -1 | 1 | undefined): void {
    void delta;
  }
}`,
      errors: [{ messageId: 'namedUnion' }],
    },
  ],
});
