import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import StartButton from "./StartButton";

describe("StartButton", () => {
  it("children을 라벨로 가진 버튼을 화면에 그린다", () => {
    render(<StartButton>시작하기</StartButton>);

    const button = screen.getByRole("button", { name: "시작하기" });

    expect(button).toBeInTheDocument();
  });

  it("처음에는 모달이 떠 있지 않다", () => {
    render(<StartButton>시작하기</StartButton>);

    expect(screen.queryByText("로그인")).not.toBeInTheDocument();
  });

  it("버튼을 누르면 모달이 열린다", async () => {
    const user = userEvent.setup();
    render(<StartButton>시작하기</StartButton>);

    expect(screen.queryByText("로그인")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "시작하기" }));

    expect(screen.getByText("로그인")).toBeInTheDocument();
  });
});
