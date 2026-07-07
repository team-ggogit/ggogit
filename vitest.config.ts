import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // tsconfig.json의 paths(@/* → src/*)를 Vite가 자체 해석하게 한다.
    // (예전에는 vite-tsconfig-paths 플러그인이 필요했지만, 이제 내장 기능으로 대체)
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
