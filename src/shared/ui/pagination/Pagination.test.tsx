import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";

import Pagination from "./Pagination";

vi.mock("@/shared/lib/sound/soundPlayer", () => ({
  playClickSound: vi.fn(),
}));
vi.mock("@/shared/model/sound/soundStore", () => ({
  useSoundStore: (selector: (state: { soundSettings: unknown }) => unknown) =>
    selector({ soundSettings: { muted: false, volume: 1 } }),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));

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
  it("totalPages 수만큼 페이지 번호가 렌더된다", () => {
    renderPagination({ totalPages: 5 });

    expect(screen.getByRole("link", { name: "5" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "6" })).not.toBeInTheDocument();
  });

  it("currentPage 번호에 aria-current가 표시된다", () => {
    renderPagination({ currentPage: 2, totalPages: 5 });

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("첫 페이지에서 '이전'은 1페이지로 clamp된다", () => {
    renderPagination({ currentPage: 1, totalPages: 5 });

    expect(screen.getByRole("link", { name: "이전 페이지" })).toHaveAttribute(
      "href",
      "/list?page=1",
    );
  });

  it("마지막 페이지에서 '다음'은 마지막 페이지로 clamp된다", () => {
    renderPagination({ currentPage: 5, totalPages: 5 });

    expect(screen.getByRole("link", { name: "다음 페이지" })).toHaveAttribute(
      "href",
      "/list?page=5",
    );
  });

  it("'첫 페이지' 버튼은 1페이지를 가리킨다", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });

    expect(screen.getByRole("link", { name: "첫 페이지" })).toHaveAttribute(
      "href",
      "/list?page=1",
    );
  });

  it("'마지막 페이지' 버튼은 마지막 페이지를 가리킨다", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });

    expect(screen.getByRole("link", { name: "마지막 페이지" })).toHaveAttribute(
      "href",
      "/list?page=5",
    );
  });
});
