"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  getCommunityFirstParagraph,
  type CommunityPost,
} from "@/entities/community";
import { Button } from "@/shared/ui/button";

import styles from "./CommunityTipsPage.module.css";

interface CommunityTipListProps {
  tips: CommunityPost[];
}

const INITIAL_TIP_COUNT = 4;
const ALL_TAG = "전체";
const TIP_TAGS = [
  ALL_TAG,
  "commit",
  "branch",
  "merge",
  "reset",
  "remote",
  "stash",
  "ignore",
];

export default function CommunityTipList({ tips }: CommunityTipListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_TIP_COUNT);
  const [selectedTag, setSelectedTag] = useState(ALL_TAG);
  const filteredTips =
    selectedTag === ALL_TAG
      ? tips
      : tips.filter((tip) => tip.tags?.includes(selectedTag));
  const visibleTips = filteredTips.slice(0, visibleCount);
  const hasMoreTips = visibleCount < filteredTips.length;

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setVisibleCount(INITIAL_TIP_COUNT);
  };

  const handleLoadMore = () => {
    setVisibleCount(filteredTips.length);
  };

  return (
    <>
      <div className={styles.tagFilter} aria-label="팁 태그 필터">
        {TIP_TAGS.map((tag) => (
          <Button
            key={tag}
            type="button"
            className={styles.tagButton}
            onClick={() => handleSelectTag(tag)}
            selected={tag === selectedTag}
            size="sm"
          >
            #{tag}
          </Button>
        ))}
      </div>
      <hr className={styles.divider} />
      <div className={styles.tipGrid}>
        {visibleTips.map((tip) => (
          <article key={tip.id} className={styles.tipCard}>
            <div className={styles.tipContent}>
              <h2>{tip.title}</h2>
              <p>{getCommunityFirstParagraph(tip)}</p>
            </div>
            <div className={styles.tipTags}>
              {tip.tags?.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
            <p className={styles.tipMeta}>
              {tip.createdAt} · 조회 {tip.viewCount}
            </p>
          </article>
        ))}
      </div>
      {hasMoreTips && (
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
