export function label(kind: string): string {
  switch (kind) {
    case 'a':
      return 'A';
    default:
      return 'other';
  }
}
