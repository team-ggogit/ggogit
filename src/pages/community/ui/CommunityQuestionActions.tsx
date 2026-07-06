"use client";

import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";

import { likeCommunityPost } from "@/features/community/api/communityReactions.action";
import { getOrCreateGuestIdentity } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { SoundLink } from "@/shared/ui/sound-link";

import styles from "./CommunityQuestionDetailPage.module.css";

interface CommunityQuestionActionsProps {
  postId: number;
  initialLikeCount: number;
}

export default function CommunityQuestionActions({
  postId,
  initialLikeCount,
}: CommunityQuestionActionsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    const identity = getOrCreateGuestIdentity();

    setErrorMessage("");

    startTransition(async () => {
      const result = await likeCommunityPost({
        postId,
        guestSessionId: identity.guestSessionId,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setLikeCount(result.data.likeCount);

      if (!result.data.didLike) {
        alert("따봉은 한 게시글에 한 번만 누를 수 있어요.");
      }
    });
  };

  return (
    <>
      <div className={styles.questionActions}>
        <SoundLink href="/community/questions" className={styles.backLink}>
          <ChevronLeft size={18} aria-hidden="true" />
          목록으로
        </SoundLink>
        <Button
          aria-label={`따봉 ${likeCount}`}
          type="button"
          className={styles.likeButton}
          disabled={isPending}
          loading={isPending}
          onClick={handleLike}
        >
          따봉 {likeCount}
        </Button>
      </div>
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </>
  );
}
