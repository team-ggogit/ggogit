import { Search } from "lucide-react";

import { getCommunityPostsByBoard } from "@/features/community/api/communityPosts";
import {
  getCommunityFirstParagraph,
  type CommunityPost,
} from "@/entities/community";
import { createClient } from "@/shared/lib/supabase/server";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/pagination";
import { SoundLink } from "@/shared/ui/sound-link";

import {
  formatCommunityPostListDate,
  isCommunityPostCreatedToday,
} from "../model/postListDate";
import styles from "./CommunityQuestionsPage.module.css";

const POSTS_PER_PAGE = 10;

interface QuestionsPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

const matchesQuestionSearch = (post: CommunityPost, query: string) =>
  [post.title, post.authorName, getCommunityFirstParagraph(post)].some(
    (value) => value?.toLowerCase().includes(query),
  );

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const params = await searchParams;
  const rawQuery = params?.q ?? "";
  const rawPage = Number(params?.page ?? "1");
  const query = rawQuery.trim().toLowerCase();
  const requestedPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const supabase = await createClient();
  const questionPosts = await getCommunityPostsByBoard(supabase, "question");
  const filteredPosts = query
    ? questionPosts.filter((post) => matchesQuestionSearch(post, query))
    : questionPosts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );
  const getPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (rawQuery.trim()) {
      params.set("q", rawQuery.trim());
    }

    params.set("page", String(page));

    return `/community/questions?${params.toString()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1>질문과 대답</h1>
        <div className={styles.actions}>
          <form action="/community/questions" className={styles.searchForm}>
            <input
              name="q"
              type="search"
              placeholder="검색어를 입력해보세요"
              className={styles.searchInput}
              defaultValue={rawQuery}
            />
            <Button
              type="submit"
              className={styles.searchButton}
              aria-label="검색"
              leftIcon={<Search size={18} />}
              variant="ghost"
            />
          </form>
          <SoundLink
            href="/community/questions/new"
            className={styles.writeButton}
          >
            질문하기
          </SoundLink>
        </div>
      </div>
      <div className={styles.boardList} aria-label="질문과 대답 게시글 목록">
        <div className={styles.boardHeader} aria-hidden="true">
          <span>글번호</span>
          <span>제목</span>
          <span>작성자</span>
          <span>작성일</span>
          <span>따봉</span>
          <span>조회</span>
        </div>
        {visiblePosts.map((post) => {
          const isNewPost = isCommunityPostCreatedToday(post.createdAtDateTime);
          const createdAtLabel = formatCommunityPostListDate(
            post.createdAtDateTime,
          );

          return (
            <SoundLink
              key={post.id}
              href={`/community/questions/${post.id}`}
              className={styles.boardRow}
            >
              <span className={styles.postId}>{post.boardPostNumber}</span>
              <h2 className={styles.postTitle}>
                {post.title}
                {post.commentCount > 0 && (
                  <span className={styles.commentCount}>
                    ({post.commentCount})
                  </span>
                )}
                {isNewPost && <span className={styles.newBadge}>NEW</span>}
              </h2>
              <span className={styles.author}>{post.authorName}</span>
              <time
                className={styles.createdAt}
                dateTime={post.createdAtDateTime}
              >
                {createdAtLabel}
              </time>
              <span className={styles.likes}>{post.likeCount}</span>
              <span className={styles.views}>{post.viewCount}</span>
              <p className={styles.mobileMeta}>
                #{post.boardPostNumber} · {post.authorName} · {createdAtLabel} ·
                따봉 {post.likeCount} · 조회 {post.viewCount}
                {isNewPost && <span className={styles.newBadge}>NEW</span>}
              </p>
            </SoundLink>
          );
        })}
      </div>
      <Pagination
        ariaLabel="질문과 대답 페이지"
        currentPage={currentPage}
        getPageHref={getPageHref}
        totalPages={totalPages}
      />
    </div>
  );
}
