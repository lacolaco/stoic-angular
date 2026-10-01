export function pick(kind: 'a' | 'b'): number {
  switch (kind) {
    case 'a':
      return 1;
    default:
      return 2;
  }
}
