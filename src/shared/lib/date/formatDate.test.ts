import { describe, it, expect } from "vitest";

import { formatDateWithDots } from "./formatDate";

describe("formatDateWithDots", () => {
  it("날짜를 'YYYY.MM.DD' 형식으로 포맷한다", () => {
    expect(formatDateWithDots("2026-07-07T09:00:00+09:00")).toBe("2026.07.07");
  });

  it("월/일을 항상 두 자리로 채운다", () => {
    expect(formatDateWithDots("2026-01-02T09:00:00+09:00")).toBe("2026.01.02");
  });

  it("Asia/Seoul 기준으로 변환한다 (UTC 자정 근처 경계)", () => {
    // UTC 3/5 15:30 = 한국 3/6 00:30 → 날짜가 하루 넘어간다
    expect(formatDateWithDots("2026-03-05T15:30:00Z")).toBe("2026.03.06");
  });
});
