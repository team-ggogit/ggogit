import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatCommunityPostListDate } from "@/pages/community/model/postListDate";

describe("formatCommunityPostListDate", () => {
  // 이 함수는 내부에서 new Date()(현재 시각)를 써서 "오늘인지"를 판단한다.
  // 테스트가 돌리는 날짜에 따라 결과가 바뀌지 않도록, "오늘"을 2026-07-07로 고정한다.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-07T09:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("주어진 날짜를 'MM.DD' 형식으로 포맷해야 한다", () => {
    expect(formatCommunityPostListDate("2020-03-05T09:00:00Z")).toBe("03.05");
  });

  it("타임존 경계 도달 시 일자가 늘어나야 한다.", () => {
    expect(formatCommunityPostListDate("2026-03-05T15:30:00Z")).toBe("03.06");
  });

  it("오늘 작성한 글은 'HH:MM' 시간 형식으로 보여주어야 한다", () => {
    // UTC 02:30 = 한국(Asia/Seoul) 11:30. 고정된 오늘(7/7)과 같은 날이므로 시간 포맷.
    expect(formatCommunityPostListDate("2026-07-07T02:30:00Z")).toBe("11:30");
  });
});
