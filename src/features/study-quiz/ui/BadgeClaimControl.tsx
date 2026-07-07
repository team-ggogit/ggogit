"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

import { useCurrentUserStore } from "@/entities/user";
import { playSuccessSound } from "@/shared/lib/sound/soundPlayer";
import { useSoundStore } from "@/shared/model/sound/soundStore";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import {
  stage1Badge,
  stage2Badge,
  stage3Badge,
  stage4Badge,
  stage5Badge,
} from "@/assets/badges";

import { claimMiniQuizChapterBadge } from "../api/studyQuizBadge.actions";
import styles from "./BadgeClaimControl.module.css";

interface BadgeClaimControlProps {
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  badgeName: string;
  canClaimBadge: boolean;
  isBadgeClaimed: boolean;
}

const CHAPTER_BADGES = [
  stage1Badge,
  stage2Badge,
  stage3Badge,
  stage4Badge,
  stage5Badge,
] as const;

export default function BadgeClaimControl({
  chapterId,
  chapterIndex,
  chapterTitle,
  badgeName,
  canClaimBadge,
  isBadgeClaimed,
}: BadgeClaimControlProps) {
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [earnedBeans, setEarnedBeans] = useState(0);
  const [claimedChapterIds, setClaimedChapterIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const soundSettings = useSoundStore((state) => state.soundSettings);
  const isLocallyClaimed = claimedChapterIds.includes(chapterId);
  const isClaimed = isBadgeClaimed || isLocallyClaimed;
  const isClaimable = canClaimBadge && !isClaimed;
  const badgeImage = CHAPTER_BADGES[chapterIndex];
  const rewardLabel = isClaimed
    ? "획득한 퍼펙트 클리어 보상"
    : isClaimable
      ? "퍼펙트 클리어 달성"
      : "퍼펙트 클리어 보상";

  const handleClaimBadge = () => {
    setClaimError(null);
    startTransition(async () => {
      const result = await claimMiniQuizChapterBadge(chapterId);

      if (!result.success) {
        setClaimError(result.error);
        return;
      }

      setEarnedBeans(result.earnedBeans);
      playSuccessSound(soundSettings);
      if (result.earnedBeans > 0) {
        const { currentUser, updateCurrentUser } =
          useCurrentUserStore.getState();

        updateCurrentUser({
          currentBeans: currentUser.currentBeans + result.earnedBeans,
        });
      }
      setClaimedChapterIds((ids) =>
        ids.includes(chapterId) ? ids : [...ids, chapterId]
      );
      setIsBadgeOpen(true);
    });
  };

  return (
    <>
      <aside
        className={styles.rewardPreview}
        data-unlocked={isClaimable || isClaimed ? "true" : "false"}
        data-claimed={isClaimed ? "true" : "false"}
        data-claimable={isClaimable ? "true" : "false"}
        aria-label={`${chapterTitle} 퍼펙트 클리어 보상`}
      >
        <div className={styles.rewardSlot}>
          <Image
            src={badgeImage}
            alt=""
            width={72}
            height={72}
            className={styles.rewardBadge}
          />
        </div>
        <div>
          <p>{rewardLabel}</p>
          <strong>{badgeName}</strong>
        </div>
        {isClaimable && (
          <Button
            className={styles.claimButton}
            disabled={isPending}
            onClick={handleClaimBadge}
          >
            {isPending ? "수령 중" : "수령하기"}
          </Button>
        )}
        {claimError && <p className={styles.claimError}>{claimError}</p>}
      </aside>

      {isBadgeOpen && (
        <Modal title="뱃지를 획득했어요!" onClose={() => setIsBadgeOpen(false)}>
          <div className={styles.badgeModalContent}>
            <Image
              src={badgeImage}
              alt=""
              width={120}
              height={120}
              className={styles.modalBadge}
            />
            <p>{badgeName} 배지를 로비에서 확인할 수 있어요.</p>
            {earnedBeans > 0 && (
              <strong className={styles.beanReward}>+{earnedBeans}콩</strong>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
