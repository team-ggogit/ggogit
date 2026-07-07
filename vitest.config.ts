import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // tsconfig.json의 paths(@/* → src/*)를 Vite가 자체 해석하게 한다.
    // (예전에는 vite-tsconfig-paths 플러그인이 필요했지만, 이제 내장 기능으로 대체)
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    // 컴포넌트 테스트는 window/document/localStorage가 필요하므로 jsdom(가짜 브라우저)을 쓴다.
    // 기존 순수 유닛 테스트도 jsdom에서 그대로 돌아간다(조금 느려질 뿐). 거슬리면 파일별 지정으로 분리.
    environment: "jsdom",
    // 매 테스트 파일 실행 전에 돌릴 셋업. 여기서 jest-dom 매처를 등록한다.
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
