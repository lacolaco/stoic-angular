import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    environment: 'node',
    // RuleTester for type-aware rules can exceed 5s on TS initialization when run in parallel
    testTimeout: 30_000,
  },
});
