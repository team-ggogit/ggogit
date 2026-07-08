import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import StartButton from "./StartButton";

describe("StartButton", () => {
  it("children을 라벨로 가진 버튼을 화면에 그린다", () => {
    // render: 컴포넌트를 가짜 브라우저(jsdom) 안에 그린다.
    render(<StartButton>시작하기</StartButton>);

    // screen: 방금 그린 화면을 뒤지는 도구.
    // getByRole("button", { name }): "시작하기 라는 이름의 버튼"을 찾는다. 없으면 여기서 에러.
    const button = screen.getByRole("button", { name: "시작하기" });

    // toBeInTheDocument: 그 버튼이 화면에 실제로 있나? (jest-dom 매처)
    expect(button).toBeInTheDocument();
  });

  it("처음에는 모달이 떠 있지 않다", () => {
    render(<StartButton>시작하기</StartButton>);

    // allowGuestEntry 기본값은 false → 열리면 모달 제목이 "로그인".
    // 아직 안 눌렀으니 그 제목은 화면에 "없어야" 한다.
    // queryByText: 없을 수도 있는 걸 찾을 땐 query* 를 쓴다(없으면 에러 대신 null 반환).
    expect(screen.queryByText("로그인")).not.toBeInTheDocument();
  });

  it("버튼을 누르면 모달이 열린다", async () => {
    // userEvent.setup(): 가상 사용자(손가락)를 준비. 클릭/입력은 비동기라 await가 필요하다.
    const user = userEvent.setup();
    render(<StartButton>시작하기</StartButton>);

    // 누르기 전엔 모달 제목이 없다.
    expect(screen.queryByText("로그인")).not.toBeInTheDocument();

    // 버튼을 클릭 → isModalOpen이 true → 모달이 열린다.
    await user.click(screen.getByRole("button", { name: "시작하기" }));

    // 이제 모달 제목("로그인")이 화면에 떠 있어야 한다.
    expect(screen.getByText("로그인")).toBeInTheDocument();
  });
});
