declare function sum(values: number[]): number;

export function average(values: number[]): number {
  return sum(values) / values.length;
}
