import { defineConfig, devices } from "@playwright/test";

// E2E는 Vitest와 완전히 분리된 도구다. 유닛/컴포넌트(src/**)는 Vitest가,
// 핵심 사용자 흐름(e2e/**)은 Playwright가 실제 브라우저로 검증한다.
export default defineConfig({
  testDir: "./e2e",
  // 흐름끼리 게스트 쿠키/localStorage가 섞이지 않도록 파일 단위 격리는 Playwright 기본값에 맡긴다.
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    // 다른 프로젝트(route-151 등)가 :3000을 쓰므로 E2E는 전용 포트 :3100에 띄운다.
    baseURL: "http://localhost:3100",
    // 실패한 흐름만 원인 추적할 수 있게 최초 재시도에서 trace를 남긴다.
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // 테스트 전 앱을 자동으로 띄운다. 이미 dev 서버가 떠 있으면 재사용한다.
  webServer: {
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
