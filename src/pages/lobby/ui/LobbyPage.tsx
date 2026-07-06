import type { CSSProperties } from "react";

import { getLatestCommunityPostsByBoard } from "@/features/community/api/communityPosts";
import type { DailyQuest, DailyQuestKey } from "@/entities/daily-quest";
import type { MiniQuizStage } from "@/entities/mini-quiz";
import { createClient } from "@/shared/lib/supabase/server";
import { Card } from "@/shared/ui/card";
import { SoundLink } from "@/shared/ui/sound-link";

import styles from "./LobbyPage.module.css";
import CommunityContent from "./CommunityContent";
import ContinueCardContent from "./ContinueCardContent";
import DailyQuestContent from "./DailyQuestContent";
import DailyTipContent from "./DailyTipContent";
import LearningRouteContent from "./LearningRouteContent";
import QuickActions from "./QuickActions";
import RecentBadgeContent, { type RecentBadge } from "./RecentBadgeContent";
import StreakCardContent from "./StreakCardContent";
import TodaySummaryContent from "./TodaySummaryContent";

const POPULAR_QUESTION_COUNT = 3;
const DAILY_TIP_POOL_SIZE = 7;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DAILY_QUEST_DEFINITIONS = [
  {
    id: "login",
    reward: 10,
    title: "로그인하기",
  },
  {
    id: "community_post",
    reward: 20,
    title: "커뮤니티에 글 남기기",
  },
  {
    id: "daily_challenge",
    reward: 30,
    title: "오늘의 챌린지 완료",
  },
] as const satisfies readonly Pick<DailyQuest, "id" | "reward" | "title">[];
const FALLING_DECORATIONS = [
  { delay: "-1s", duration: "22s", drift: "6s", kind: "bean", left: "7%" },
  { delay: "-8s", duration: "28s", drift: "7s", kind: "leaf", left: "15%" },
  { delay: "-15s", duration: "24s", drift: "5s", kind: "bean", left: "24%" },
  { delay: "-4s", duration: "31s", drift: "8s", kind: "sprout", left: "33%" },
  { delay: "-18s", duration: "27s", drift: "6s", kind: "leaf", left: "42%" },
  { delay: "-10s", duration: "23s", drift: "7s", kind: "bean", left: "50%" },
  { delay: "-2s", duration: "30s", drift: "8s", kind: "leaf", left: "59%" },
  { delay: "-20s", duration: "26s", drift: "5s", kind: "sprout", left: "67%" },
  { delay: "-12s", duration: "29s", drift: "6s", kind: "bean", left: "76%" },
  { delay: "-6s", duration: "25s", drift: "7s", kind: "leaf", left: "84%" },
  { delay: "-16s", duration: "32s", drift: "8s", kind: "bean", left: "91%" },
  { delay: "-23s", duration: "27s", drift: "6s", kind: "leaf", left: "98%" },
  { delay: "-5s", duration: "33s", drift: "7s", kind: "sprout", left: "3%" },
  { delay: "-19s", duration: "26s", drift: "6s", kind: "bean", left: "19%" },
  { delay: "-11s", duration: "34s", drift: "8s", kind: "leaf", left: "29%" },
  { delay: "-25s", duration: "28s", drift: "7s", kind: "bean", left: "38%" },
  { delay: "-7s", duration: "31s", drift: "6s", kind: "sprout", left: "55%" },
  { delay: "-21s", duration: "24s", drift: "5s", kind: "leaf", left: "72%" },
  { delay: "-14s", duration: "30s", drift: "7s", kind: "bean", left: "88%" },
  { delay: "-28s", duration: "35s", drift: "8s", kind: "leaf", left: "94%" },
] as const;

type FallingDecorationStyle = CSSProperties & {
  "--fall-delay": string;
  "--fall-drift-duration": string;
  "--fall-duration": string;
  "--fall-left": string;
};

interface LobbyActivityStats {
  currentStreakDays: number;
  lastStudiedOn: string | null;
}

interface LobbyLearningSummary {
  challengeCompleted: boolean;
  joinedDayCount: number;
  learnedStageCount: number;
}

interface LobbyDailyQuestSummary {
  isAuthenticated: boolean;
  quests: DailyQuest[];
}

interface ContinueStage {
  chapterNumber: number;
  href: string;
  progressPercent: number;
  stage: MiniQuizStage;
  stageNumber: string;
  stageTitle: string;
  totalProgressText: string;
}

const getKstDateString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  });
  const dateParts = formatter.formatToParts(new Date());
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

const getInclusiveDayCount = (dateText: string | null) => {
  if (!dateText) {
    return 1;
  }

  const createdAt = new Date(dateText);

  if (Number.isNaN(createdAt.getTime())) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor((Date.now() - createdAt.getTime()) / MILLISECONDS_PER_DAY) + 1,
  );
};

const getKstDayRange = (dateText: string) => {
  const startedAt = new Date(`${dateText}T00:00:00+09:00`);
  const endedAt = new Date(startedAt.getTime() + MILLISECONDS_PER_DAY);

  return {
    endedAt: endedAt.toISOString(),
    startedAt: startedAt.toISOString(),
  };
};

const createDailyQuest = ({
  completedQuestKeys,
  claimedQuestKeys,
  definition,
}: {
  claimedQuestKeys: Set<DailyQuestKey>;
  completedQuestKeys: Set<DailyQuestKey>;
  definition: (typeof DAILY_QUEST_DEFINITIONS)[number];
}): DailyQuest => {
  const isClaimed = claimedQuestKeys.has(definition.id);
  const isCompleted = completedQuestKeys.has(definition.id);

  return {
    ...definition,
    currentProgress: isCompleted ? 1 : 0,
    status: isClaimed ? "claimed" : isCompleted ? "completed" : "inProgress",
    targetProgress: 1,
  };
};

const getLatestBadge = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<RecentBadge | null> => {
  const { data: badge } = await supabase
    .from("user_chapter_badges")
    .select("chapter_id,claimed_at")
    .order("claimed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!badge) {
    return null;
  }

  const { data: chapter } = await supabase
    .from("mini_quiz_chapters")
    .select("display_order,title,badge_name")
    .eq("id", badge.chapter_id)
    .maybeSingle();

  if (!chapter) {
    return null;
  }

  return {
    badgeName: String(chapter.badge_name),
    chapterDisplayOrder: Number(chapter.display_order),
    chapterTitle: String(chapter.title),
    claimedAt: String(badge.claimed_at),
  };
};

const getContinueStage = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<ContinueStage> => {
  const [
    {
      data: { user },
    },
    { data: chapters },
    { data: stages },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("mini_quiz_chapters")
      .select("id,display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("mini_quiz_stages")
      .select(
        "chapter_id,stage_number,display_order,title,command,description,unlock_stage_number",
      )
      .order("display_order", { ascending: true }),
  ]);
  const progressQuery = user
    ? await supabase
        .from("user_stage_progress")
        .select("chapter_id,stage_number,best_star_count,first_cleared_at")
        .eq("user_id", user.id)
    : { data: [] };
  const chapterRows = chapters ?? [];
  const stageRows = stages ?? [];
  const progressRows = progressQuery.data ?? [];
  const progressKeys = new Set(
    progressRows
      .filter((progress) => progress.first_cleared_at)
      .map((progress) => `${progress.chapter_id}:${progress.stage_number}`),
  );
  const clearedStageCount = progressKeys.size;
  const totalStageCount = stageRows.length;
  const progressPercent =
    totalStageCount > 0
      ? Math.round((clearedStageCount / totalStageCount) * 100)
      : 0;
  const orderedStages = chapterRows.flatMap((chapter) =>
    stageRows
      .filter((stage) => stage.chapter_id === chapter.id)
      .map((stage) => ({
        ...stage,
        chapterDisplayOrder: chapter.display_order,
      })),
  );
  const nextStage =
    orderedStages.find((stage) => {
      const stageKey = `${stage.chapter_id}:${stage.stage_number}`;
      const unlockStageKey = `${stage.chapter_id}:${stage.unlock_stage_number}`;

      return (
        !progressKeys.has(stageKey) &&
        (!stage.unlock_stage_number || progressKeys.has(unlockStageKey))
      );
    }) ?? orderedStages[orderedStages.length - 1];

  if (!nextStage) {
    return {
      chapterNumber: 1,
      href: "/study",
      progressPercent: 0,
      stage: {
        id: "1",
        stageNumber: 1,
        title: "첫 스테이지를 시작해요",
        command: "git init",
        description: "학습하기 페이지에서 첫 스테이지를 골라 시작해요.",
        status: "available",
        starCount: 0,
      },
      stageNumber: "학습하기",
      stageTitle: "첫 스테이지를 시작해요",
      totalProgressText: "0 / 0",
    };
  }

  const nextStageKey = `${nextStage.chapter_id}:${nextStage.stage_number}`;
  const nextStageProgress = progressRows.find(
    (progress) =>
      progress.chapter_id === nextStage.chapter_id &&
      progress.stage_number === nextStage.stage_number,
  );
  const nextStageStatus = progressKeys.has(nextStageKey)
    ? "completed"
    : "available";

  return {
    chapterNumber: Number(nextStage.chapterDisplayOrder),
    href: `/study/${nextStage.chapter_id}/${nextStage.stage_number}`,
    progressPercent,
    stage: {
      id: String(nextStage.stage_number),
      stageNumber: Number(nextStage.stage_number),
      title: String(nextStage.title),
      command: String(nextStage.command),
      description: String(nextStage.description),
      unlockStageNumber: nextStage.unlock_stage_number,
      status: nextStageStatus,
      starCount: (nextStageProgress?.best_star_count ??
        0) as MiniQuizStage["starCount"],
    },
    stageNumber: `${nextStage.chapterDisplayOrder}-${nextStage.stage_number}`,
    stageTitle:
      progressPercent === 100 ? "모든 스테이지를 완료했어요" : nextStage.title,
    totalProgressText: `${clearedStageCount} / ${totalStageCount}`,
  };
};

const getLobbyActivityStats = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<LobbyActivityStats> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      currentStreakDays: 0,
      lastStudiedOn: null,
    };
  }

  const { data } = await supabase
    .from("user_activity_stats")
    .select("current_streak_days,last_studied_on")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    currentStreakDays: data?.current_streak_days ?? 0,
    lastStudiedOn: data?.last_studied_on ?? null,
  };
};

const getLobbyLearningSummary = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<LobbyLearningSummary> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      challengeCompleted: false,
      joinedDayCount: 1,
      learnedStageCount: 0,
    };
  }

  const todayDate = getKstDateString();
  const [
    { count: learnedStageCount },
    { data: challengeAttempt },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("user_stage_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("first_cleared_at", "is", null),
    supabase
      .from("daily_git_quiz_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("author_role", "user")
      .eq("quiz_date", todayDate)
      .eq("status", "completed")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  return {
    challengeCompleted: Boolean(challengeAttempt),
    joinedDayCount: getInclusiveDayCount(profile?.created_at ?? null),
    learnedStageCount: learnedStageCount ?? 0,
  };
};

const getLobbyDailyQuestSummary = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<LobbyDailyQuestSummary> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      quests: DAILY_QUEST_DEFINITIONS.map((definition) =>
        createDailyQuest({
          claimedQuestKeys: new Set(),
          completedQuestKeys: new Set(),
          definition,
        }),
      ),
    };
  }

  const todayDate = getKstDateString();
  const { endedAt, startedAt } = getKstDayRange(todayDate);
  const [
    { data: completions },
    { data: communityPost },
    { data: challengeAttempt },
  ] = await Promise.all([
    supabase
      .from("user_daily_quest_completions")
      .select("quest_key,claimed_at")
      .eq("user_id", user.id)
      .eq("quest_date", todayDate),
    supabase
      .from("community_posts")
      .select("id")
      .eq("author_id", user.id)
      .eq("author_role", "user")
      .eq("is_published", true)
      .in("board", ["guestbook", "question"])
      .gte("created_at", startedAt)
      .lt("created_at", endedAt)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_git_quiz_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("author_role", "user")
      .eq("quiz_date", todayDate)
      .eq("status", "completed")
      .maybeSingle(),
  ]);
  const completedQuestKeys = new Set<DailyQuestKey>(["login"]);
  const claimedQuestKeys = new Set<DailyQuestKey>(
    (completions ?? [])
      .filter((completion) => completion.claimed_at)
      .map((completion) => completion.quest_key as DailyQuestKey),
  );

  if (communityPost) {
    completedQuestKeys.add("community_post");
  }

  if (challengeAttempt) {
    completedQuestKeys.add("daily_challenge");
  }

  return {
    isAuthenticated: true,
    quests: DAILY_QUEST_DEFINITIONS.map((definition) =>
      createDailyQuest({
        claimedQuestKeys,
        completedQuestKeys,
        definition,
      }),
    ),
  };
};

export default async function LobbyPage() {
  const supabase = await createClient();
  const [
    questionPosts,
    latestTips,
    latestBadge,
    activityStats,
    continueStage,
    dailyQuestSummary,
    learningSummary,
  ] = await Promise.all([
    getLatestCommunityPostsByBoard(supabase, "question", 20),
    getLatestCommunityPostsByBoard(supabase, "tip", DAILY_TIP_POOL_SIZE),
    getLatestBadge(supabase),
    getLobbyActivityStats(supabase),
    getContinueStage(supabase),
    getLobbyDailyQuestSummary(supabase),
    getLobbyLearningSummary(supabase),
  ]);
  const popularQuestions = [...questionPosts]
    .sort((firstQuestion, secondQuestion) => {
      const firstScore =
        firstQuestion.likeCount * 2 +
        firstQuestion.commentCount * 3 +
        firstQuestion.viewCount;
      const secondScore =
        secondQuestion.likeCount * 2 +
        secondQuestion.commentCount * 3 +
        secondQuestion.viewCount;

      return secondScore - firstScore;
    })
    .slice(0, POPULAR_QUESTION_COUNT);
  const dailyTip =
    latestTips.length > 0
      ? latestTips[new Date().getDay() % latestTips.length]
      : null;

  return (
    <>
      <div className={styles.lobbyStage}>
        <div className={styles.fallingLayer} aria-hidden="true">
          {FALLING_DECORATIONS.map((decoration, index) => (
            <span
              key={`${decoration.kind}-${index}`}
              className={styles.fallingDecoration}
              data-kind={decoration.kind}
              style={
                {
                  "--fall-delay": decoration.delay,
                  "--fall-drift-duration": decoration.drift,
                  "--fall-duration": decoration.duration,
                  "--fall-left": decoration.left,
                } as FallingDecorationStyle
              }
            />
          ))}
        </div>
        <div className={styles.lobbyGrid}>
        <Card
          id="continue-card"
          title="이어하기"
          tone="primaryStrong"
          className={styles.span4}
        >
          <ContinueCardContent
            chapterNumber={continueStage.chapterNumber}
            href={continueStage.href}
            progressPercent={continueStage.progressPercent}
            stage={continueStage.stage}
            stageNumber={continueStage.stageNumber}
            stageTitle={continueStage.stageTitle}
            totalProgressText={continueStage.totalProgressText}
          />
        </Card>
        <Card
          id="streak-card"
          title="연속 학습"
          tone="primaryPale"
          className={`${styles.span2} ${styles.desktopOnly}`}
        >
          <StreakCardContent
            currentStreakDays={activityStats.currentStreakDays}
            lastStudiedOn={activityStats.lastStudiedOn}
          />
        </Card>
        <QuickActions className={styles.mobileOnly} />
        <Card
          id="today-summary-card"
          title="학습 요약"
          tone="secondaryPale"
          className={`${styles.span2} ${styles.desktopOnly}`}
        >
          <TodaySummaryContent
            challengeCompleted={learningSummary.challengeCompleted}
            joinedDayCount={learningSummary.joinedDayCount}
            learnedStageCount={learningSummary.learnedStageCount}
          />
        </Card>
        <Card
          id="daily-quest-card"
          title="데일리 퀘스트"
          headerAction={<a href="#">13:45 남음</a>}
          tone="primaryPale"
          className={styles.span3}
        >
          <DailyQuestContent
            isAuthenticated={dailyQuestSummary.isAuthenticated}
            quests={dailyQuestSummary.quests}
          />
        </Card>
        <Card
          id="learning-route-card"
          title="추천 학습 루트"
          tone="primaryPale"
          className={`${styles.span3} ${styles.desktopOnly}`}
        >
          <LearningRouteContent />
        </Card>
        <Card
          id="recent-badge-card"
          title="최근 획득 배지"
          tone="primaryPale"
          className={`${styles.span2} ${styles.desktopOnly}`}
        >
          <RecentBadgeContent badge={latestBadge} />
        </Card>
        <Card
          id="community-card"
          title="커뮤니티 인기 질문"
          headerAction={
            <SoundLink href="/community/questions">더 보기</SoundLink>
          }
          tone="primaryPale"
          className={`${styles.span4} ${styles.desktopOnly}`}
        >
          <CommunityContent questions={popularQuestions} />
        </Card>
        <Card
          id="daily-tip-card"
          title="오늘의 팁"
          tone="primaryPale"
          className={styles.span4}
        >
          <DailyTipContent tip={dailyTip} />
        </Card>
        </div>
      </div>
    </>
  );
}
