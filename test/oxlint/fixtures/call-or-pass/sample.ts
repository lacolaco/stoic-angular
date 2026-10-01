export function mixed(value: { run(): void }, consume: (v: unknown) => void): void {
  value.run();
  consume(value);
}
