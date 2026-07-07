import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthRequiredModal } from "@/features/auth";
import { useCurrentUserStore } from "@/entities/user";
import { trackEvent } from "@/shared/lib/analytics";
import { Button } from "@/shared/ui/button";
import { SoundLink } from "@/shared/ui/sound-link";

import { useMiniQuizStageContext } from "./MiniQuizStageProvider";
import styles from "./MiniQuizResultActions.module.css";

export default function MiniQuizResultActions() {
  const { isCleared, retry } = useMiniQuizStageContext();
  const authRole = useCurrentUserStore((state) => state.currentUser.authRole);
  const [isAuthModalDismissed, setIsAuthModalDismissed] = useState(false);
  const canPromptSave = authRole === "anonymous" && isCleared;
  const isAuthModalOpen = canPromptSave && !isAuthModalDismissed;

  useEffect(() => {
    if (!isAuthModalOpen) {
      return;
    }

    trackEvent("anonymous_save_prompt_auto_shown", {
      source: "study_stage",
    });
  }, [isAuthModalOpen]);

  return (
    <>
      <div className={styles.resultActions}>
        <Button
          className={styles.secondaryButton}
          leftIcon={<RotateCcw size={18} />}
          onClick={retry}
          size="lg"
          variant="secondary"
        >
          다시 풀기
        </Button>
        <SoundLink href="/study" className={styles.primaryLink}>
          스테이지 선택으로
        </SoundLink>
      </div>
      {isAuthModalOpen && (
        <AuthRequiredModal
          title="로그인하면 기록을 저장할 수 있어요"
          description="지금 결과는 저장되지 않아요. 로그인하면 클리어 기록, 별, 콩 보상을 저장할 수 있어요."
          reason="save_progress"
          source="study"
          onClose={() => setIsAuthModalDismissed(true)}
        />
      )}
    </>
  );
}
