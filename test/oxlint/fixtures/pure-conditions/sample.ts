export function impure(items: number[]): number {
  if (items.pop() === 1) {
    return 1;
  }
  return 0;
}
