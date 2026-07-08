import { expect, test } from "@playwright/test";

// 흐름 2: (게스트) 미니 퀴즈 스테이지 클리어 → 별 반영
// 게스트 문제는 결정론적: 객관식은 첫 보기가 정답, 명령어는 정답이 placeholder("예: <명령어>")에 있다.
test("게스트가 미니 퀴즈 스테이지를 클리어하고 별을 받는다", async ({ page }) => {
  await page.goto("/auth/guest");
  await expect(page).toHaveURL(/\/lobby$/);
  await page.goto("/study");

  await page.locator('button[data-status="available"]').first().click();
  await page.getByRole("link", { name: "시작하기" }).click();
  await expect(page).toHaveURL(/\/study\/[^/]+\/\d+$/);

  for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
    const commandInput = page.getByRole("textbox");

    if (await commandInput.count()) {
      const placeholder = await commandInput.getAttribute("placeholder");
      await commandInput.fill((placeholder ?? "").replace(/^예:\s*/, ""));
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
    page.getByRole("heading", { name: "스테이지를 클리어했어요!" }),
  ).toBeVisible();
  await expect(page.getByLabel("별 3개")).toBeVisible();
});
