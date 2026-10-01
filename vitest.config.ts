import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    environment: 'node',
    // 型情報つきルールの RuleTester は並列実行時の TS 初期化で 5s を超えうる
    testTimeout: 30_000,
  },
});
