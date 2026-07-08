import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";

import ChallengeQuizQuestionPanel from "./ChallengeQuizQuestionPanel";

const { holder } = vi.hoisted(() => ({ holder: { value: null as unknown } }));

vi.mock("./ChallengeQuizProvider", () => ({
  useChallengeQuizContext: () => holder.value,
}));
vi.mock("@/shared/ui/sound-link", () => ({
  SoundLink: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/assets/mascot", () => ({ ggoggoThumbsUp: "mascot" }));

const mcqQuestion = {
  question: "질문",
  description: "설명",
  explanation: "해설",
  type: "mcq",
  options: [
    { id: "a", text: "선택지 A" },
    { id: "b", text: "선택지 B" },
  ],
};

const commandQuestion = {
  question: "질문",
  description: "설명",
  explanation: "해설",
  type: "command",
  placeholder: "git commit",
};

function makeContext(overrides: Record<string, unknown> = {}) {
  return {
    commandAnswer: "",
    correctAnswer: "a",
    currentIndex: 0,
    currentQuestion: mcqQuestion,
    elapsedMs: 0,
    errorMessage: "",
    isCorrect: false,
    isFeedback: false,
    isPending: false,
    progressPercent: 0,
    questionCount: 3,
    selectedAnswer: null,
    submittedAnswer: null,
    setCommandAnswer: vi.fn(),
    goNext: vi.fn(),
    selectAnswer: vi.fn(),
    submitAnswer: vi.fn(),
    ...overrides,
  };
}

describe("ChallengeQuizQuestionPanel", () => {
  it("객관식(mcq)이면 옵션 버튼을 그리고, 누르면 그 id로 selectAnswer가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext();
    holder.value = context;

    render(<ChallengeQuizQuestionPanel />);

    await user.click(screen.getByRole("button", { name: "선택지 A" }));

    expect(context.selectAnswer).toHaveBeenCalledWith("a");
  });

  it("서술형(command)이면 입력창을 그리고, 입력하면 setCommandAnswer가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext({ currentQuestion: commandQuestion });
    holder.value = context;

    render(<ChallengeQuizQuestionPanel />);

    await user.type(screen.getByRole("textbox"), "g");

    expect(context.setCommandAnswer).toHaveBeenCalledWith("g");
  });

  it("isFeedback이면 정답 피드백을 표시한다", () => {
    holder.value = makeContext({ isFeedback: true, isCorrect: true });

    render(<ChallengeQuizQuestionPanel />);

    expect(screen.getByText("정답이에요!")).toBeInTheDocument();
  });

  it("선택된 답이 없으면 제출 버튼이 비활성이다", () => {
    holder.value = makeContext({ selectedAnswer: null });

    render(<ChallengeQuizQuestionPanel />);

    expect(screen.getByRole("button", { name: "제출하기" })).toBeDisabled();
  });

  it("답을 선택한 뒤 제출하면 그 답으로 submitAnswer가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext({ selectedAnswer: "a" });
    holder.value = context;

    render(<ChallengeQuizQuestionPanel />);

    await user.click(screen.getByRole("button", { name: "제출하기" }));

    expect(context.submitAnswer).toHaveBeenCalledWith("a");
  });

  it("isFeedback이면 '다음 문제 풀기'를 누를 때 goNext가 호출된다", async () => {
    const user = userEvent.setup();
    const context = makeContext({ isFeedback: true, currentIndex: 0 });
    holder.value = context;

    render(<ChallengeQuizQuestionPanel />);

    await user.click(screen.getByRole("button", { name: "다음 문제 풀기" }));

    expect(context.goNext).toHaveBeenCalledTimes(1);
  });

  it("마지막 문제의 피드백에서는 '결과 보기'로 표시된다", () => {
    holder.value = makeContext({
      isFeedback: true,
      currentIndex: 2,
      questionCount: 3,
    });

    render(<ChallengeQuizQuestionPanel />);

    expect(
      screen.getByRole("button", { name: "결과 보기" }),
    ).toBeInTheDocument();
  });
});
