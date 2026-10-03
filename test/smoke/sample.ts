export function long(): number {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  const e = 5;
  const f = 6;
  return a + b + c + d + e + f;
}

export function short(): number {
  const a = 1;
  const b = 2;
  return a + b;
}

export function nested(a: boolean, b: boolean): number {
  return a ? b ? 1 : 2 : 3;
}

export function step(i: number): void {
  i++, i++;
}
