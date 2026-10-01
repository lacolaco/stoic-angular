export class CounterViewModel {
  count: number = 0;

  increment(): number {
    return this.count + 1;
  }
}
