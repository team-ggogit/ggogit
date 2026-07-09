import { expect, test } from "@playwright/test";

// 흐름 3: (게스트) 데일리 퀴즈 도전 → 완주 후 로그인 유도
// 게스트 결과는 랭킹에 기록되지 않고 소셜 로그인을 유도한다(의도된 동작).
// 실제 문제라 정답을 모르지만, 완주 흐름만 검증하므로 아무 답이나 제출한다.
test("게스트가 데일리 퀴즈를 완주하면 로그인 유도 안내가 뜬다", async ({ page }) => {
  await page.goto("/auth/guest");
  await expect(page).toHaveURL(/\/lobby$/);

  await page.goto("/challenge");
  await page.getByRole("button", { name: "도전 시작하기" }).click();
  await page.getByRole("link", { name: "시작하기" }).click();
  await expect(page).toHaveURL(/\/challenge\/play$/);

  for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
    const commandInput = page.getByRole("textbox");

    if (await commandInput.count()) {
      await commandInput.fill("git status");
    } else {
      await page.locator("button[data-status]").first().click();
    }

    await page.getByRole("button", { name: "제출하기" }).click();
    await page
      .getByRole("button", {
        name: questionIndex === 4 ? "결과 보기" : "다음 문제 풀기",
      })
      .click();
  }

  await expect(
    page.getByRole("heading", { name: "오늘의 도전을 마쳤어요!" }),
  ).toBeVisible();
  await expect(
    page.getByText("지금 결과는 저장되지 않았어요. 로그인하면 랭킹에 도전할 수 있어요."),
  ).toBeVisible();
});
