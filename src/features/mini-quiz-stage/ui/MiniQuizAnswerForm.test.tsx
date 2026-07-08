import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import MiniQuizAnswerForm from "./MiniQuizAnswerForm";

const { holder } = vi.hoisted(() => ({ holder: { value: null as unknown } }));

vi.mock("./MiniQuizStageProvider", () => ({
  useMiniQuizStageContext: () => holder.value,
}));

function makeContext(overrides: Record<string, unknown> = {}) {
  return {
    commandAnswer: "",
    currentQuestion: {
      id: "q1",
      type: "mcq",
      question: "질문",
      description: "",
      options: [
        { id: "a", text: "선택지 A" },
        { id: "b", text: "선택지 B" },
      ],
      answer: "a",
      explanation: "",
    },
    isFeedback: false,
    selectedAnswer: null,
    submittedAnswer: null,
    setCommandAnswer: vi.fn(),
    selectAnswer: vi.fn(),
    ...overrides,
  };
}

describe("MiniQuizAnswerForm", () => {
  it("command 타입이면 입력창(textbox)을 그린다", () => {
    holder.value = makeContext({
      currentQuestion: {
        id: "q1",
        type: "command",
        question: "질문",
        description: "",
        placeholder: "git commit ...",
        answer: "git commit",
        explanation: "",
      },
    });

    render(<MiniQuizAnswerForm />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("mcq 타입이면 옵션 버튼들을 그린다", () => {
    holder.value = makeContext();

    render(<MiniQuizAnswerForm />);

    expect(
      screen.getByRole("button", { name: "선택지 A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "선택지 B" }),
    ).toBeInTheDocument();
  });

  it("mcq인데 options가 없으면 아무것도 그리지 않는다", () => {
    holder.value = makeContext({
      currentQuestion: {
        id: "q1",
        type: "mcq",
        question: "질문",
        description: "",
        options: undefined,
        answer: "a",
        explanation: "",
      },
    });

    const { container } = render(<MiniQuizAnswerForm />);

    expect(container).toBeEmptyDOMElement();
  });

  it("isFeedback이면 옵션 버튼이 비활성(disabled)이다", () => {
    holder.value = makeContext({ isFeedback: true });

    render(<MiniQuizAnswerForm />);

    expect(screen.getByRole("button", { name: "선택지 A" })).toBeDisabled();
  });

  it("옵션을 누르면 그 옵션 id로 selectAnswer가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext();
    holder.value = context;

    render(<MiniQuizAnswerForm />);

    await user.click(screen.getByRole("button", { name: "선택지 A" }));

    expect(context.selectAnswer).toHaveBeenCalledWith("a");
  });
});
