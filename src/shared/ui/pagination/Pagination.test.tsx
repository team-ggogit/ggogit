import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";

import Pagination from "./Pagination";

// Pagination은 내부에서 SoundLink를 쓴다 → SoundLink가 의존하는 것들을 함께 mock.
// (SoundLink.test.tsx에서 배운 3종 세트 재사용)
vi.mock("@/shared/lib/sound/soundPlayer", () => ({
  playClickSound: vi.fn(),
}));
vi.mock("@/shared/model/sound/soundStore", () => ({
  useSoundStore: (selector: (state: { soundSettings: unknown }) => unknown) =>
    selector({ soundSettings: { muted: false, volume: 1 } }),
}));
// 여기선 href를 "그대로 유지"한다 — Pagination의 핵심이 "어느 페이지를 가리키나"라서.
vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));

// 매번 같은 기본 props로 렌더하는 헬퍼. 필요한 것만 덮어쓴다.
type RenderProps = {
  currentPage?: number;
  totalPages?: number;
};
const renderPagination = (props: RenderProps = {}) =>
  render(
    <Pagination
      ariaLabel="페이지네이션"
      currentPage={1}
      totalPages={5}
      getPageHref={(page) => `/list?page=${page}`}
      {...props}
    />,
  );

describe("Pagination", () => {
  // 1. totalPages 수만큼 번호 버튼이 렌더된다. (5는 있고 6은 없다 = 정확히 5개)
  it("totalPages 수만큼 페이지 번호가 렌더된다", () => {
    renderPagination({ totalPages: 5 });

    expect(screen.getByRole("link", { name: "5" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "6" })).not.toBeInTheDocument();
  });

  // 2. 현재 페이지 번호에 aria-current="page"가 붙는다.
  it("currentPage 번호에 aria-current가 표시된다", () => {
    renderPagination({ currentPage: 2, totalPages: 5 });

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  // 3. ⭐ 경계(하한): 1페이지에서 "이전"은 0이 아니라 1로 clamp된다.
  it("첫 페이지에서 '이전'은 1페이지로 clamp된다", () => {
    renderPagination({ currentPage: 1, totalPages: 5 });

    expect(screen.getByRole("link", { name: "이전 페이지" })).toHaveAttribute(
      "href",
      "/list?page=1",
    );
  });

  // 4. ⭐ 경계(상한): 마지막 페이지에서 "다음"은 초과하지 않고 마지막으로 clamp된다.
  it("마지막 페이지에서 '다음'은 마지막 페이지로 clamp된다", () => {
    renderPagination({ currentPage: 5, totalPages: 5 });

    expect(screen.getByRole("link", { name: "다음 페이지" })).toHaveAttribute(
      "href",
      "/list?page=5",
    );
  });

  // 5. "첫 페이지" 버튼은 현재 위치와 무관하게 항상 1을 가리킨다.
  it("'첫 페이지' 버튼은 1페이지를 가리킨다", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });

    expect(screen.getByRole("link", { name: "첫 페이지" })).toHaveAttribute(
      "href",
      "/list?page=1",
    );
  });

  // 6. "마지막 페이지" 버튼은 항상 마지막(totalPages)을 가리킨다.
  it("'마지막 페이지' 버튼은 마지막 페이지를 가리킨다", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });

    expect(screen.getByRole("link", { name: "마지막 페이지" })).toHaveAttribute(
      "href",
      "/list?page=5",
    );
  });
});
