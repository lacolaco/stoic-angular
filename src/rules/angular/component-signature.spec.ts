import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { componentSignature } from './component-signature';

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

tester.run('component-signature', componentSignature, {
  valid: [
    {
      name: 'protected handlers and private injected fields in a component are allowed',
      code: `import { Component, ElementRef, inject } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly host = inject(ElementRef);
  protected close(): void {}
}`,
    },
    {
      name: 'Injecting the view model in 1-1 correspondence with itself is allowed',
      code: `import { Component, Injectable, inject, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly opened = signal(false);
  toggle(): void {
    this.opened.update((open) => !open);
  }
}
@Component({ template: '', providers: [PanelViewModel] })
export class Panel {
  protected readonly vm = inject(PanelViewModel);
}`,
    },
    {
      name: 'Injecting framework infrastructure such as ElementRef is allowed',
      code: `import { Component, ElementRef, inject } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly host = inject(ElementRef);
}`,
    },
    {
      name: 'A plain component with only input/output is allowed',
      code: `import { Component, input, output } from '@angular/core';
@Component({ template: '' })
export class Row {
  readonly label = input('');
  readonly picked = output();
}`,
    },
    {
      name: 'Classes other than components are ignored',
      code: `import { Injectable, Service, inject, signal } from '@angular/core';
@Service()
export class Zoom {
  readonly step = signal(0);
  stepBy(): void {
    this.step.update((v) => v + 1);
  }
}
@Injectable()
export class PanelViewModel {
  private readonly zoom = inject(Zoom);
}`,
    },
  ],
  invalid: [
    {
      name: 'private methods in a component are forbidden',
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
      name: 'private arrow function fields are also forbidden',
      code: `import { Component } from '@angular/core';
@Component({ template: '' })
export class Panel {
  private readonly tally = (): number => 1;
}`,
      errors: [{ messageId: 'privateMethod' }],
    },
    {
      name: 'Injecting a domain service directly is forbidden',
      code: `import { Component, Service, inject, signal } from '@angular/core';
@Service()
export class Manuscripts {
  readonly list = signal<readonly string[]>([]);
  clear(): void {
    this.list.set([]);
  }
}
@Component({ template: '' })
export class Panel {
  protected readonly manuscripts = inject(Manuscripts);
}`,
      errors: [{ messageId: 'foreignInject' }],
    },
    {
      name: 'Injecting the view model of another component is forbidden',
      code: `import { Component, Injectable, inject } from '@angular/core';
@Injectable()
export class OtherViewModel {}
@Component({ template: '' })
export class Panel {
  protected readonly vm = inject(OtherViewModel);
}`,
      errors: [{ messageId: 'foreignInject' }],
    },
    {
      name: 'Mixing input/output with view model injection is forbidden',
      code: `import { Component, Injectable, inject, input } from '@angular/core';
@Injectable()
export class PanelViewModel {}
@Component({ template: '' })
export class Panel {
  readonly label = input('');
  protected readonly vm = inject(PanelViewModel);
}`,
      errors: [{ messageId: 'mixedRole' }],
    },
  ],
});
