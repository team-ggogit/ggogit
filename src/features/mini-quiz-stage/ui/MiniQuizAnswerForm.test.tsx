import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import MiniQuizAnswerForm from "./MiniQuizAnswerForm";

// ── 컨텍스트 세팅(방법 B) ─────────────────────────────────────────
// MiniQuizAnswerForm은 useMiniQuizStageContext()에서 값을 받는다.
// 진짜 Provider(라우터·스토어·타이머 덩어리) 대신, 그 훅만 가짜로 바꿔치기해서
// "우리가 정한 컨텍스트 값"을 뱉게 한다. → 이 컴포넌트의 렌더링만 격리해서 본다.
//
// vi.hoisted: vi.mock은 파일 맨 위로 끌어올려지므로, mock이 참조할 값도
// 같이 끌어올려 둔다. holder.value를 테스트마다 바꿔 컨텍스트를 갈아끼운다.
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
    selectAnswer: vi.fn(), // 가짜 함수: "불렸나 / 뭘 넣고 불렸나"를 기록한다.
    ...overrides,
  };
}
// ──────────────────────────────────────────────────────────────────

describe("MiniQuizAnswerForm", () => {
  // 케이스 1: command 타입이면 명령어 입력창을 그린다.
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
    // 객관식 옵션 버튼은 없어야 한다.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // 케이스 2: mcq 타입이면 옵션 버튼들을 그린다.
  it("mcq 타입이면 옵션 버튼들을 그린다", () => {
    holder.value = makeContext(); // 기본값이 옵션 2개짜리 mcq

    render(<MiniQuizAnswerForm />);

    expect(
      screen.getByRole("button", { name: "선택지 A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "선택지 B" }),
    ).toBeInTheDocument();
  });

  // 케이스 3: options가 없으면 아무것도 그리지 않는다(null).
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

    // 화면에 아무 요소도 없다.
    expect(container).toBeEmptyDOMElement();
  });

  // 케이스 4: isFeedback(채점 후)이면 옵션 버튼이 비활성이다.
  it("isFeedback이면 옵션 버튼이 비활성(disabled)이다", () => {
    holder.value = makeContext({ isFeedback: true });

    render(<MiniQuizAnswerForm />);

    expect(screen.getByRole("button", { name: "선택지 A" })).toBeDisabled();
  });

  // 케이스 5: 옵션을 누르면 그 id로 selectAnswer가 불린다. (제일 핵심 상호작용)
  it("옵션을 누르면 그 옵션 id로 selectAnswer가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext();
    holder.value = context; // 이번 테스트가 쓸 컨텍스트를 꽂는다.

    render(<MiniQuizAnswerForm />);

    // "선택지 A" 버튼을 클릭.
    await user.click(screen.getByRole("button", { name: "선택지 A" }));

    // selectAnswer가 그 옵션 id("a")로 호출됐어야 한다.
    expect(context.selectAnswer).toHaveBeenCalledWith("a");
  });
});
