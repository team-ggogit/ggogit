"use client";

import { BeanIcon, CheckCircleIcon, CircleIcon } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { AuthRequiredModal } from "@/features/auth";
import {
  claimDailyQuestRewardsAction,
  type ClaimDailyQuestRewardsState,
} from "@/features/daily-quest/api/dailyQuest.actions";
import type { DailyQuest } from "@/entities/daily-quest";
import { trackEvent } from "@/shared/lib/analytics";
import { playSuccessSound } from "@/shared/lib/sound/soundPlayer";
import { useSoundStore } from "@/shared/model/sound/soundStore";
import { Button } from "@/shared/ui/button";

import styles from "./DailyQuestContent.module.css";

interface DailyQuestContentProps {
  isAuthenticated: boolean;
  quests: DailyQuest[];
}

const INITIAL_CLAIM_STATE: ClaimDailyQuestRewardsState = {
  earnedBeans: 0,
  message: null,
  success: false,
};

export default function DailyQuestContent({
  isAuthenticated,
  quests,
}: DailyQuestContentProps) {
  const [claimState, claimAction, isClaimPending] = useActionState(
    claimDailyQuestRewardsAction,
    INITIAL_CLAIM_STATE,
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const previousClaimStateRef = useRef(claimState);
  const soundSettings = useSoundStore((state) => state.soundSettings);
  const claimableReward = quests.reduce(
    (sum, quest) => (quest.status === "completed" ? sum + quest.reward : sum),
    0,
  );
  const isAllClaimed = quests.every((quest) => quest.status === "claimed");
  const isClaimDisabled = claimableReward === 0 || isClaimPending;
  const buttonLabel = isClaimPending
    ? "받는 중"
    : claimableReward > 0
      ? "보상 받기"
      : isAllClaimed
        ? "데일리 퀘스트 완료!"
        : "진행 중";

  useEffect(() => {
    if (
      previousClaimStateRef.current !== claimState &&
      claimState.success &&
      claimState.earnedBeans > 0
    ) {
      playSuccessSound(soundSettings);
    }

    previousClaimStateRef.current = claimState;
  }, [claimState, soundSettings]);

  return (
    <div className={styles.dailyQuestCard}>
      <div className={styles.dailyQuestList}>
        {quests.map((quest) => {
          const isInProgress = quest.status === "inProgress";
          const StatusIcon = isInProgress ? CircleIcon : CheckCircleIcon;

          return (
            <div
              key={quest.id}
              className={styles.dailyQuestItem}
              data-status={quest.status}
            >
              <StatusIcon
                size={20}
                className={styles.statusIcon}
                aria-hidden="true"
              />
              <div className={styles.questContainer}>
                <p className={styles.questContent}>{quest.title}</p>
                <p className={styles.progress}>
                  {quest.currentProgress}/{quest.targetProgress}
                </p>
              </div>
              <div className={styles.rewardContainer}>
                <BeanIcon
                  size={16}
                  className={styles.rewardIcon}
                  aria-hidden="true"
                />
                <span>+{quest.reward}</span>
              </div>
              {quest.status === "claimed" && (
                <span className={styles.claimedOverlay}>수령 완료</span>
              )}
            </div>
          );
        })}
      </div>
      <form
        action={isAuthenticated ? claimAction : undefined}
        className={styles.receiveForm}
        onSubmit={(event) => {
          if (isAuthenticated) {
            return;
          }

          event.preventDefault();
          trackEvent("anonymous_reward_attempt", { source: "daily_quest" });
          setIsAuthModalOpen(true);
        }}
      >
        <Button
          className={styles.receiveButton}
          disabled={isClaimDisabled}
          type="submit"
        >
          <span>{buttonLabel}</span>
        </Button>
      </form>
      {claimState.message && (
        <p className={styles.claimMessage} data-success={claimState.success}>
          {claimState.message}
        </p>
      )}
      {isAuthModalOpen && (
        <AuthRequiredModal
          title="로그인해야 보상을 받을 수 있어요"
          description="로그인하면 데일리 퀘스트 보상과 콩 기록을 저장할 수 있어요."
          reason="claim_reward"
          source="daily_quest"
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
