import { describe, it, expect } from "vitest";

import { findMiniQuizStage } from "./miniQuizContent";

describe("findMiniQuizStage", () => {
  it("존재하는 챕터/스테이지를 찾는다", () => {
    const result = findMiniQuizStage("git-start", "1");

    expect(result).not.toBeNull();
    expect(result?.chapter.id).toBe("git-start");
    expect(result?.stage.stageNumber).toBe(1);
  });

  it("없는 챕터면 null", () => {
    expect(findMiniQuizStage("no-such-chapter", "1")).toBeNull();
  });

  it("챕터는 있지만 없는 스테이지면 null", () => {
    expect(findMiniQuizStage("git-start", "999")).toBeNull();
  });

  it("숫자가 아닌 stageId면 null", () => {
    expect(findMiniQuizStage("git-start", "abc")).toBeNull();
  });
});
