import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: '<p>{{ label }}</p>',
})
export class SampleComponent {
  label = 'sample';

  // component-signature (type-aware): private method in a component
  private format(value: string): string {
    return value.trim();
  }

  // no-getter-setter (type-aware): syntactic get accessor
  get upper(): string {
    return this.format(this.label).toUpperCase();
  }

  // no-else (not type-aware)
  pick(flag: boolean): string {
    if (flag) {
      return 'a';
    } else {
      return 'b';
    }
  }
}
