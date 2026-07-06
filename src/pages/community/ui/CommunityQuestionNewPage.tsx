"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { ChevronLeft } from "lucide-react";

import { createQuestionPost } from "@/features/community/api/communityQuestions.action";
import { getOrCreateGuestIdentity } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { SoundLink } from "@/shared/ui/sound-link";

import styles from "./CommunityQuestionNewPage.module.css";

export default function NewQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const identity = getOrCreateGuestIdentity();

    setErrorMessage("");

    startTransition(async () => {
      const result = await createQuestionPost({
        title,
        content,
        guestSessionId: identity.guestSessionId,
        guestName: identity.guestName,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      router.push(`/community/questions/${result.data.id}`);
      router.refresh();
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1>질문하기</h1>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>제목</span>
          <input
            type="text"
            placeholder="질문 제목을 입력해주세요"
            className={styles.input}
            value={title}
            disabled={isPending}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>내용</span>
          <textarea
            rows={8}
            placeholder="궁금한 내용을 자세히 적어주세요"
            className={styles.textarea}
            value={content}
            disabled={isPending}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.actions}>
          <SoundLink
            href="/community/questions"
            className={styles.cancelButton}
          >
            <ChevronLeft size={18} aria-hidden="true" />
            목록으로
          </SoundLink>
          <Button
            type="submit"
            className={styles.submitButton}
            disabled={isPending}
            loading={isPending}
          >
            등록
          </Button>
        </div>
      </form>
    </div>
  );
}
