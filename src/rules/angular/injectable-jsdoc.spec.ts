import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { injectableJsdoc } from './injectable-jsdoc';

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

tester.run('injectable-jsdoc', injectableJsdoc, {
  valid: [
    {
      name: 'Public members with JSDoc are allowed',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Manuscripts {
  private readonly list = signal<readonly string[]>([]);

  /** Manuscript file list */
  readonly files = this.list.asReadonly();

  /** Excludes the last manuscript */
  remove(): void {
    this.list.set(this.files().slice(0, -1));
  }
}`,
    },
    {
      name: 'private members and the constructor are ignored',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Zoom {
  private readonly step = signal(0);

  private tally(): number {
    return this.step();
  }

  /** Advances a stage */
  stepBy(): void {
    this.step.update((v) => v + 1);
  }
}`,
    },
    {
      name: 'Classes without a decorator are ignored',
      code: `export class Ranges {
  readonly values: number[] = [];
}`,
    },
  ],
  invalid: [
    {
      name: 'Public members without JSDoc are violations even with @Injectable',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly isOpened = signal(false);
}`,
      errors: [{ messageId: 'missingDoc' }],
    },
    {
      name: 'Public fields without JSDoc are violations',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Manuscripts {
  readonly files = signal<readonly string[]>([]);
}`,
      errors: [{ messageId: 'missingDoc' }],
    },
    {
      name: 'Public methods without JSDoc are violations',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Zoom {
  private readonly step = signal(0);

  stepBy(): void {
    this.step.update((v) => v + 1);
  }
}`,
      errors: [{ messageId: 'missingDoc' }],
    },
    {
      name: 'Line comments are not treated as JSDoc',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Zoom {
  // stage
  readonly step = signal(0);
}`,
      errors: [{ messageId: 'missingDoc' }],
    },
  ],
});
