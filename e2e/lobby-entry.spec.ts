import { expect, test } from "@playwright/test";

// 흐름 1: (게스트) 로비 진입
test("게스트가 홈에서 로비까지 진입한다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "시작하기!" }).click();
  await expect(
    page.getByRole("heading", { name: "꼬깃 시작하기" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "게스트로 둘러보기" }).click();
  await expect(page).toHaveURL(/\/lobby$/);

  await expect(page.getByRole("heading", { name: "이어하기" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "데일리 퀘스트" }),
  ).toBeVisible();
});
