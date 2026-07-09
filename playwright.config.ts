import { readFileSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// E2E 전용 환경변수(.env.e2e)를 읽어 dev 서버로 넘긴다.
// 테스트 전용 Supabase를 가리켜 운영 DB 오염을 막는다.
const loadE2eEnv = (): Record<string, string> => {
  try {
    return Object.fromEntries(
      readFileSync(".env.e2e", "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
  } catch {
    return {};
  }
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    // route-151 등이 :3000을 쓰므로 E2E는 전용 포트 :3100에 띄운다.
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: loadE2eEnv(),
  },
});
