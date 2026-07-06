"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";

import { createGuestbookPost } from "@/features/community/api/communityGuestbook.action";
import {
  getCommunityFirstParagraph,
  type CommunityPost,
} from "@/entities/community";
import { getOrCreateGuestIdentity } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { SoundLink } from "@/shared/ui/sound-link";
import { ggoggoSmile } from "@/assets/mascot";

import styles from "./CommunityPage.module.css";

interface CommunityGuestbookListProps {
  entries: CommunityPost[];
}

const INITIAL_GUESTBOOK_COUNT = 4;

export default function CommunityGuestbookList({
  entries,
}: CommunityGuestbookListProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addedEntries, setAddedEntries] = useState<CommunityPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_GUESTBOOK_COUNT);
  const [isPending, startTransition] = useTransition();
  const guestbookEntries = useMemo(() => {
    const entryIds = new Set(entries.map((entry) => entry.id));
    const visibleAddedEntries = addedEntries.filter(
      (entry) => !entryIds.has(entry.id),
    );

    return [...visibleAddedEntries, ...entries];
  }, [addedEntries, entries]);
  const visibleEntries = guestbookEntries.slice(0, visibleCount);
  const hasMoreEntries = visibleCount < guestbookEntries.length;

  const handleLoadMore = () => {
    setVisibleCount(guestbookEntries.length);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newContent = content.trim();

    if (!newContent) {
      setErrorMessage("방명록 내용을 입력해주세요.");
      return;
    }

    const identity = getOrCreateGuestIdentity();

    setErrorMessage("");

    startTransition(async () => {
      const result = await createGuestbookPost({
        content: newContent,
        guestSessionId: identity.guestSessionId,
        guestName: identity.guestName,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setContent("");
      setAddedEntries((currentEntries) => [result.data, ...currentEntries]);
      setVisibleCount((currentVisibleCount) =>
        Math.max(currentVisibleCount, INITIAL_GUESTBOOK_COUNT),
      );
      router.refresh();
    });
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          rows={4}
          placeholder="착한말 고운말!"
          className={styles.textarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        {errorMessage && <p className={styles.formError}>{errorMessage}</p>}
        <Button
          type="submit"
          className={styles.button}
          disabled={isPending}
          loading={isPending}
        >
          등록
        </Button>
      </form>
      <hr className={styles.divider} />
      <div className={styles.commentList}>
        {visibleEntries.map((entry) => (
          <div key={entry.id} className={styles.commentBox}>
            {entry.authorId ? (
              <SoundLink
                href={`/profile/${entry.authorId}`}
                className={styles.avatarLink}
                aria-label={`${entry.authorName} 프로필 보기`}
              >
                <Image
                  src={entry.authorAvatarUrl ?? ggoggoSmile}
                  alt=""
                  width={44}
                  height={44}
                  className={styles.avatar}
                />
              </SoundLink>
            ) : (
              <Image
                src={entry.authorAvatarUrl ?? ggoggoSmile}
                alt={`${entry.authorName} 프로필`}
                width={44}
                height={44}
                className={styles.avatar}
              />
            )}
            <div className={styles.commentBubble}>
              <p className={styles.nickname}>{entry.authorName}</p>
              <p className={styles.commentContent}>
                {getCommunityFirstParagraph(entry)}
              </p>
              <time
                className={styles.createdAt}
                dateTime={entry.createdAtDateTime}
              >
                {entry.createdAt}
              </time>
            </div>
          </div>
        ))}
      </div>
      {hasMoreEntries && (
        <Button
          type="button"
          className={styles.loadMoreButton}
          onClick={handleLoadMore}
          rightIcon={<ChevronDown size={18} />}
          variant="secondary"
        >
          더보기
        </Button>
      )}
    </>
  );
}
