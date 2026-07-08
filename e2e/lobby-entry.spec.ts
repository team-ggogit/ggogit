import { expect, test } from "@playwright/test";

// 흐름 1: (게스트) 로비 진입
test("게스트가 홈에서 로비까지 진입한다", async ({ page }) => {
  await page.goto("/");

  // 히어로 영역의 시작 버튼("시작하기!")을 눌러 시작 모달을 연다.
  await page.getByRole("button", { name: "시작하기!" }).click();
  await expect(
    page.getByRole("heading", { name: "꼬깃 시작하기" }),
  ).toBeVisible();

  // 게스트로 입장하면 /auth/guest 가 쿠키를 심고 /lobby 로 리다이렉트한다.
  await page.getByRole("button", { name: "게스트로 둘러보기" }).click();
  await expect(page).toHaveURL(/\/lobby$/);

  // 로비의 개인화 카드가 실제로 렌더되는지 확인한다(단순 이동이 아니라 화면이 뜨는가).
  await expect(page.getByRole("heading", { name: "이어하기" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "데일리 퀘스트" }),
  ).toBeVisible();
});
