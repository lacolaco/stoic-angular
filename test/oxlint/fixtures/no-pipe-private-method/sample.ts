// @ts-nocheck -- @angular/core is not installed in this repository
import { Pipe } from '@angular/core';

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  private twice(value: number): number {
    return value * 2;
  }
}
