import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("children을 라벨로 렌더한다", () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("leftIcon을 주면 렌더된다", () => {
    render(<Button leftIcon={<span>아이콘</span>}>확인</Button>);
    expect(screen.getByText("아이콘")).toBeInTheDocument();

    //   const { container } = render(<Button leftIcon={<LensConcaveIcon />}>확인</Button>);
    //   expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("loading이면 스피너가 뜬다", () => {
    render(<Button loading>확인</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("loading이면 children이 보이지 않는다", () => {
    render(<Button loading>확인</Button>);
    expect(screen.queryByText("확인")).not.toBeInTheDocument();
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>확인</Button>);

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        확인
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled면 버튼이 비활성이다", () => {
    render(<Button disabled>확인</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading이면 버튼이 비활성이다", () => {
    render(<Button loading>확인</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("selected면 aria-pressed가 true다", () => {
    render(<Button selected>확인</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("type을 안 주면 기본이 button이다", () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
