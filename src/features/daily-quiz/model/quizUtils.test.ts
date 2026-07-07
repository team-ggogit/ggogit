import { describe, it, expect } from "vitest";

import {
  calculateScore,
  formatElapsedTime,
  normalizeCommand,
} from "./quizUtils";

describe("normalizeCommand", () => {
  it("명령어의 앞뒤 공백을 제거해야 한다", () => {
    expect(normalizeCommand("  hello  ")).toBe("hello");
  });

  it("중간의 연속 공백을 한 칸으로 줄인다", () => {
    expect(normalizeCommand("git   commit   -m")).toBe("git commit -m");
  });
});

describe("formatElapsedTime", () => {
  it("경과 시간을 분:초 형식으로 포맷해야 한다", () => {
    expect(formatElapsedTime(65000)).toBe("1:05");
  });

  it("0ms는 0:00", () => {
    expect(formatElapsedTime(0)).toBe("0:00");
  });

  it("초는 항상 두 자리로 채운다", () => {
    expect(formatElapsedTime(5000)).toBe("0:05");
  });

  it("정확히 1분이면 1:00", () => {
    expect(formatElapsedTime(60000)).toBe("1:00");
  });
});

describe("calculateScore", () => {
  it("정답 점수(개수*200)에 속도 보너스를 더한다", () => {
    // 65초 소요 → 보너스 max(0, 300 - 65*3) = 105 → 1000 + 105
    expect(calculateScore(5, 65000)).toBe(1105);
  });

  it("0초에 다 맞히면 최대 속도 보너스(300)를 받는다", () => {
    expect(calculateScore(5, 0)).toBe(1300);
  });

  it("오래 걸리면 속도 보너스가 음수가 아니라 0으로 잘린다", () => {
    // 200초 → 300 - 600 = -300 이지만 Math.max(0, ...)로 0 → 1000 + 0
    expect(calculateScore(5, 200000)).toBe(1000);
  });

  it("보너스가 정확히 0이 되는 경계(100초)에서도 음수가 되지 않는다", () => {
    // 100초 → 300 - 300 = 0 (음수 직전 경계)
    expect(calculateScore(0, 100000)).toBe(0);
  });

  it("정답이 0개여도 속도 보너스는 반영된다", () => {
    // 정답 0 → 0점, 10초 → 보너스 300 - 30 = 270
    expect(calculateScore(0, 10000)).toBe(270);
  });
});
