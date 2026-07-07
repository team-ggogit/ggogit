import { Send } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { normalizeCommand } from "../model/quizUtils";
import { useMiniQuizStageContext } from "./MiniQuizStageProvider";
import styles from "./MiniQuizActions.module.css";

export default function MiniQuizActions() {
  const {
    commandAnswer,
    currentIndex,
    currentQuestion,
    goNext,
    isFeedback,
    isSubmitting,
    questionCount,
    selectedAnswer,
    submitAnswer,
  } = useMiniQuizStageContext();

  if (isFeedback) {
    return (
      <div className={styles.quizActions}>
        <Button className={styles.primaryButton} onClick={goNext} size="lg">
          {currentIndex === questionCount - 1 ? "결과 보기" : "다음 문제 풀기"}
        </Button>
      </div>
    );
  }

  const isSubmitDisabled =
    currentQuestion.type === "command"
      ? normalizeCommand(commandAnswer).length === 0
      : !selectedAnswer;
  const nextAnswer =
    currentQuestion.type === "command" ? commandAnswer : selectedAnswer;

  return (
    <div className={styles.quizActions}>
      <Button
        className={styles.primaryButton}
        disabled={isSubmitDisabled || isSubmitting}
        leftIcon={<Send size={18} />}
        onClick={() => submitAnswer(nextAnswer)}
        size="lg"
      >
        {isSubmitting ? "채점 중" : "제출하기"}
      </Button>
    </div>
  );
}
