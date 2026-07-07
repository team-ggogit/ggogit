import { describe, it, expect } from "vitest";

import { MINI_QUIZ_CHAPTERS } from "@/entities/mini-quiz";

import {
  buildQuizQuestions,
  getQuestionLimit,
  getQuestionLimitMs,
  getStarCount,
  normalizeCommand,
} from "./quizUtils";

describe("getStarCount", () => {
  it("정답 5개 이상이면 별 3개", () => {
    expect(getStarCount(5)).toBe(3);
  });

  it("정답 4개면 별 2개", () => {
    expect(getStarCount(4)).toBe(2);
  });

  it("정답 3개면 별 1개", () => {
    expect(getStarCount(3)).toBe(1);
  });

  it("정답 2개 이하면 별 0개", () => {
    expect(getStarCount(2)).toBe(0);
  });
});

describe("normalizeCommand", () => {
  it("앞뒤 공백을 제거한다", () => {
    expect(normalizeCommand("  git status  ")).toBe("git status");
  });

  it("중간의 연속 공백을 한 칸으로 줄인다", () => {
    expect(normalizeCommand("git    add    .")).toBe("git add .");
  });
});

describe("getQuestionLimit / getQuestionLimitMs", () => {
  const chapter = MINI_QUIZ_CHAPTERS[0];
  const stage = chapter.stages[0];
  const questions = buildQuizQuestions(chapter, stage);
  const commandQuestion = questions.find((q) => q.type === "command")!;
  const mcqQuestion = questions.find((q) => q.type === "mcq")!;

  it("명령어 입력 문항의 제한 시간은 45초", () => {
    expect(getQuestionLimit(commandQuestion)).toBe(45);
  });

  it("객관식 문항의 제한 시간은 20초", () => {
    expect(getQuestionLimit(mcqQuestion)).toBe(20);
  });

  it("밀리초 변환은 초 * 1000", () => {
    expect(getQuestionLimitMs(commandQuestion)).toBe(45000);
    expect(getQuestionLimitMs(mcqQuestion)).toBe(20000);
  });
});

describe("buildQuizQuestions", () => {
  const chapter = MINI_QUIZ_CHAPTERS[0];
  const stage = chapter.stages[0];
  const questions = buildQuizQuestions(chapter, stage);

  it("문항은 5개를 만든다", () => {
    expect(questions).toHaveLength(5);
  });

  it("첫 문항의 정답(a)은 이 스테이지의 명령어다", () => {
    const first = questions[0];
    expect(first.answer).toBe("a");
    expect(first.options?.[0].text).toBe(stage.command);
  });

  it("객관식 문항의 보기는 4개다", () => {
    const mcq = questions[0];
    expect(mcq.options).toHaveLength(4);
  });

  it("마지막 명령어 입력 문항의 정답은 스테이지 명령어다", () => {
    const commandQuestion = questions.find((q) => q.type === "command")!;
    expect(commandQuestion.answer).toBe(stage.command);
  });
});
