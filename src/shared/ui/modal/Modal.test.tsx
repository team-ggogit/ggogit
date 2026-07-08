import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import Modal from "./Modal";

describe("Modal", () => {
  it("title을 렌더한다", () => {
    render(
      <Modal title="제목" onClose={vi.fn()}>
        내용
      </Modal>,
    );
    expect(screen.getByRole("heading", { name: "제목" })).toBeInTheDocument();
  });

  it("children을 렌더한다", () => {
    render(
      <Modal title="제목" onClose={vi.fn()}>
        내용
      </Modal>,
    );
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("닫기 버튼을 누르면 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="제목" onClose={onClose}>
        내용
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "모달 닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("오버레이를 누르면 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="제목" onClose={onClose}>
        내용
      </Modal>,
    );

    const overlay = screen.getByRole("dialog").parentElement;
    await user.click(overlay as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("모달 안쪽을 누르면 onClose가 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="제목" onClose={onClose}>
        내용
      </Modal>,
    );

    await user.click(screen.getByText("내용"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("portal로 render 컨테이너 밖에 렌더된다", () => {
    const { container } = render(
      <Modal title="제목" onClose={vi.fn()}>
        내용
      </Modal>,
    );

    expect(container).not.toContainElement(screen.getByRole("dialog"));
    expect(document.body).toContainElement(screen.getByRole("dialog"));
  });
});
