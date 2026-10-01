import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { vmSignature } from './vm-signature';

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

tester.run('vm-signature', vmSignature, {
  valid: [
    {
      name: 'Signal queries and void / Promise<void> commands are allowed',
      code: `import { Injectable, type Signal, computed, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  private readonly opened = signal(false);
  readonly sheetOpen: Signal<boolean> = this.opened.asReadonly();
  readonly label: Signal<string> = computed(() => (this.opened() ? 'open' : 'closed'));
  toggle(): void {
    this.opened.update((open) => !open);
  }
  save(): Promise<void> {
    return Promise.resolve();
  }
}`,
    },
    {
      name: 'Explicitly exposing WritableSignal is allowed',
      code: `import { Injectable, type WritableSignal, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly draft: WritableSignal<string> = signal('');
  clear(): void {
    this.draft.set('');
  }
}`,
    },
    {
      name: 'private members are ignored',
      code: `import { Injectable, type Signal, computed, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  private readonly opened = signal(false);
  private stash(): boolean {
    return this.opened();
  }
  readonly view: Signal<boolean> = computed(() => this.opened());
}`,
    },
    {
      name: 'Classes other than ViewModels are ignored',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Zoom {
  readonly step = signal(0);
  isSteppable(): boolean {
    return true;
  }
}`,
    },
  ],
  invalid: [
    {
      name: 'A query without a type annotation is forbidden',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly opened = signal(false);
}`,
      errors: [{ messageId: 'querySignature' }],
    },
    {
      name: 'A non-readonly query is forbidden',
      code: `import { Injectable, type Signal, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  opened: Signal<boolean> = signal(false).asReadonly();
}`,
      errors: [{ messageId: 'querySignature' }],
    },
    {
      name: 'A query of a non-Signal type is forbidden',
      code: `import { Injectable } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly total: number = 0;
}`,
      errors: [{ messageId: 'querySignature' }],
    },
    {
      name: 'A command that returns a value is forbidden',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  private readonly count = signal(0);
  bump(): number {
    this.count.update((v) => v + 1);
    return this.count();
  }
}`,
      errors: [{ messageId: 'commandSignature' }],
    },
    {
      name: 'A command without a return type is forbidden',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  private readonly count = signal(0);
  bump() {
    this.count.update((v) => v + 1);
  }
}`,
      errors: [{ messageId: 'commandSignature' }],
    },
  ],
});
