"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { createCommunityComment } from "@/features/community/api/communityComments.action";
import type { CommunityComment } from "@/entities/community";
import { getOrCreateGuestIdentity } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { SoundLink } from "@/shared/ui/sound-link";
import { ggoggoSmile } from "@/assets/mascot";

import styles from "./CommunityQuestionDetailPage.module.css";

interface CommunityQuestionCommentsProps {
  postId: number;
  comments: CommunityComment[];
}

export default function CommunityQuestionComments({
  postId,
  comments,
}: CommunityQuestionCommentsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addedComments, setAddedComments] = useState<CommunityComment[]>([]);
  const [isPending, startTransition] = useTransition();
  const visibleComments = useMemo(() => {
    const commentIds = new Set(comments.map((comment) => comment.id));
    const visibleAddedComments = addedComments.filter(
      (comment) => !commentIds.has(comment.id),
    );

    return [...comments, ...visibleAddedComments];
  }, [addedComments, comments]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newContent = content.trim();

    if (!newContent) {
      setErrorMessage("답변 내용을 입력해주세요.");
      return;
    }

    const identity = getOrCreateGuestIdentity();

    setErrorMessage("");

    startTransition(async () => {
      const result = await createCommunityComment({
        postId,
        content: newContent,
        guestSessionId: identity.guestSessionId,
        guestName: identity.guestName,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setContent("");
      setAddedComments((currentComments) => [
        ...currentComments,
        result.data,
      ]);
      router.refresh();
    });
  };

  return (
    <>
      <section className={styles.answerSection} aria-labelledby="answers-title">
        <h2 id="answers-title">답변 {visibleComments.length}</h2>
        <div className={styles.answerList}>
          {visibleComments.map((comment) => (
            <article key={comment.id} className={styles.answerItem}>
              {comment.authorId ? (
                <SoundLink
                  href={`/profile/${comment.authorId}`}
                  className={styles.avatarLink}
                  aria-label={`${comment.authorName} 프로필 보기`}
                >
                  <Image
                    src={comment.authorAvatarUrl ?? ggoggoSmile}
                    alt=""
                    width={44}
                    height={44}
                    className={styles.avatar}
                  />
                </SoundLink>
              ) : (
                <Image
                  src={comment.authorAvatarUrl ?? ggoggoSmile}
                  alt={`${comment.authorName} 프로필`}
                  width={44}
                  height={44}
                  className={styles.avatar}
                />
              )}
              <div className={styles.answerBubble}>
                <div className={styles.answerMeta}>
                  <strong>{comment.authorName}</strong>
                  <time dateTime={comment.createdAtDateTime}>
                    {comment.createdAt}
                  </time>
                </div>
                <p>{comment.content}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <form className={styles.answerForm} onSubmit={handleSubmit}>
        <textarea
          rows={4}
          placeholder="답변을 남겨주세요!"
          className={styles.textarea}
          value={content}
          disabled={isPending}
          onChange={(event) => setContent(event.target.value)}
        />
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <Button
          type="submit"
          className={styles.submitButton}
          disabled={isPending}
          loading={isPending}
        >
          등록
        </Button>
      </form>
    </>
  );
}
