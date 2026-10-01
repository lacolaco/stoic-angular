import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noStateOnlyService } from './no-state-only-service';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts', 'src/app/components/*.ts'],
      },
      tsconfigRootDir: __dirname,
    },
  },
});

tester.run('no-state-only-service', noStateOnlyService, {
  valid: [
    {
      name: 'a domain service holding both state and operations is allowed',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class Manuscripts {
  private readonly list = signal<readonly string[]>([]);
  readonly files = this.list.asReadonly();
  remove(name: string): void {
    this.list.set(this.files().filter((f) => f !== name));
  }
}`,
    },
    {
      name: 'resource is allowed without operations because it runs by itself',
      code: `import { Service, computed, resource } from '@angular/core';
@Service()
export class Doc {
  private readonly pipeline = resource({ loader: () => Promise.resolve(1) });
  readonly total = computed(() => this.pipeline.value() ?? 0);
}`,
    },
    {
      name: 'a view model colocated with a component is allowed',
      filename: 'src/app/components/b.vm.ts',
      code: `import { Injectable, computed, signal } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly opened = signal(false);
  readonly label = computed(() => (this.opened() ? 'open' : 'closed'));
  toggle(): void {
    this.opened.update((open) => !open);
  }
}`,
    },
    {
      name: 'a class without a decorator is out of scope',
      filename: 'ranges.ts',
      code: `export class Ranges {
  readonly values: number[] = [];
}`,
    },
  ],
  invalid: [
    {
      name: 'a state-only service without operations is prohibited',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class CounterHolder {
  readonly count = signal(0);
}`,
      errors: [{ messageId: 'stateOnly' }],
    },
    {
      name: 'an @Injectable with providedIn is treated as global and a State class is prohibited',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CounterState {
  readonly count = signal(0);
  bump(): void {
    this.count.update((v) => v + 1);
  }
}`,
      errors: [{ messageId: 'globalState' }],
    },
    {
      name: 'a global State class is prohibited',
      code: `import { Service, signal } from '@angular/core';
@Service()
export class ZoomState {
  readonly step = signal(0);
  stepBy(): void {
    this.step.update((v) => v + 1);
  }
}`,
      errors: [{ messageId: 'globalState' }],
    },
    {
      name: 'an @Injectable that is not shaped as a view model is prohibited',
      filename: 'src/app/components/c.ts',
      code: `import { Injectable, signal } from '@angular/core';
@Injectable()
export class Panel {
  readonly opened = signal(false);
  toggle(): void {
    this.opened.update((open) => !open);
  }
}`,
      errors: [{ messageId: 'vmShape' }],
    },
    {
      name: 'prohibited if named ViewModel but the file is not *.vm.ts',
      filename: 'src/app/components/c.ts',
      code: `import { Injectable, computed } from '@angular/core';
@Injectable()
export class PanelViewModel {
  readonly label = computed(() => '');
}`,
      errors: [{ messageId: 'vmShape' }],
    },
  ],
});
