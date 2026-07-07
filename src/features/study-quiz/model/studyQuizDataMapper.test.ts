import { describe, it, expect } from "vitest";

import { MINI_QUIZ_CHAPTERS } from "@/entities/mini-quiz";

import {
  mapMiniQuizStudyData,
  preventEmptyStudyData,
} from "./studyQuizDataMapper";
import type {
  MiniQuizChapterRow,
  MiniQuizStageRow,
  UserStageProgressRow,
} from "./types";

// --- 픽스처: 한 챕터(c1)에 스테이지 2개(s1 잠금해제, s2는 s1 클리어 시 해제) ---
const chapter: MiniQuizChapterRow = {
  id: "c1",
  display_order: 1,
  title: "챕터 1",
  description: "설명",
  commands: ["git init"],
  badge_name: "별 배지",
};

const stage1: MiniQuizStageRow = {
  chapter_id: "c1",
  stage_number: 1,
  slug: "s1",
  display_order: 1,
  title: "스테이지 1",
  command: "git init",
  description: "설명",
  unlock_stage_number: null,
};

const stage2: MiniQuizStageRow = {
  chapter_id: "c1",
  stage_number: 2,
  slug: "s2",
  display_order: 2,
  title: "스테이지 2",
  command: "git status",
  description: "설명",
  unlock_stage_number: 1,
};

const cleared = (
  stageNumber: number,
  starCount: number,
): UserStageProgressRow => ({
  chapter_id: "c1",
  stage_number: stageNumber,
  best_star_count: starCount,
  first_cleared_at: "2026-01-01T00:00:00Z",
});

const baseParams = {
  chapters: [chapter],
  stages: [stage1, stage2],
  progressRows: [] as UserStageProgressRow[],
  badgeRows: [] as { chapter_id: string }[],
  activityStats: null,
  userId: "user-1" as string | undefined,
};

describe("mapMiniQuizStudyData - 스테이지 상태", () => {
  it("진행 기록이 없으면 첫 스테이지는 available, 다음은 locked", () => {
    const result = mapMiniQuizStudyData(baseParams);
    const [s1, s2] = result.chapters[0].stages;

    expect(s1.status).toBe("available");
    expect(s2.status).toBe("locked");
    expect(s1.starCount).toBe(0);
  });

  it("선행 스테이지를 클리어하면 다음 스테이지가 available 로 열린다", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 2)],
    });
    const [s1, s2] = result.chapters[0].stages;

    expect(s1.status).toBe("completed");
    expect(s1.starCount).toBe(2);
    expect(s2.status).toBe("available");
  });
});

describe("mapMiniQuizStudyData - 배지 수령 조건", () => {
  it("모든 스테이지 3별 + 로그인 + 미수령이면 배지를 받을 수 있다", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 3), cleared(2, 3)],
    });
    const mappedChapter = result.chapters[0];

    expect(mappedChapter.canClaimBadge).toBe(true);
    expect(mappedChapter.isBadgeClaimed).toBe(false);
    expect(mappedChapter.isBadgeUnlocked).toBe(true);
  });

  it("별이 하나라도 3개 미만이면 배지를 받을 수 없다", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 3), cleared(2, 2)],
    });

    expect(result.chapters[0].canClaimBadge).toBe(false);
  });

  it("이미 수령한 배지는 다시 받을 수 없다(claimed=true, canClaim=false)", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 3), cleared(2, 3)],
      badgeRows: [{ chapter_id: "c1" }],
    });
    const mappedChapter = result.chapters[0];

    expect(mappedChapter.isBadgeClaimed).toBe(true);
    expect(mappedChapter.canClaimBadge).toBe(false);
    expect(mappedChapter.isBadgeUnlocked).toBe(true);
  });

  it("비로그인(userId 없음)이면 3별을 다 채워도 받을 수 없다", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 3), cleared(2, 3)],
      userId: undefined,
    });

    expect(result.chapters[0].canClaimBadge).toBe(false);
  });
});

describe("mapMiniQuizStudyData - 요약(summary)", () => {
  it("클리어 수/총 별/총 스테이지를 집계한다", () => {
    const result = mapMiniQuizStudyData({
      ...baseParams,
      progressRows: [cleared(1, 3), cleared(2, 3)],
    });

    expect(result.summary.clearedStageCount).toBe(2);
    expect(result.summary.totalStageCount).toBe(2);
    expect(result.summary.totalStarCount).toBe(6);
  });

  it("스트릭은 activityStats에서 오고, 없으면 0", () => {
    const withStats = mapMiniQuizStudyData({
      ...baseParams,
      activityStats: { current_streak_days: 5 },
    });
    const withoutStats = mapMiniQuizStudyData(baseParams);

    expect(withStats.summary.currentStreakDays).toBe(5);
    expect(withoutStats.summary.currentStreakDays).toBe(0);
  });
});

describe("preventEmptyStudyData", () => {
  it("서버 데이터 없이도 기본 챕터 목록과 0 스트릭을 반환한다", () => {
    const result = preventEmptyStudyData();

    expect(result.chapters).toHaveLength(MINI_QUIZ_CHAPTERS.length);
    expect(result.summary.currentStreakDays).toBe(0);
    expect(result.summary.totalStageCount).toBeGreaterThan(0);
  });
});
