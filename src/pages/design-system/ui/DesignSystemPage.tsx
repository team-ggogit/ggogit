import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Pagination } from "@/shared/ui/pagination";

import styles from "./DesignSystemPage.module.css";

const COLOR_GROUPS = [
  {
    title: "Primary",
    colors: [
      ["Deep", "--primary-deep"],
      ["Strong", "--primary-strong"],
      ["Base", "--primary-base"],
      ["Soft", "--primary-soft"],
      ["Pale", "--primary-pale"],
    ],
  },
  {
    title: "Secondary",
    colors: [
      ["Deep", "--secondary-deep"],
      ["Strong", "--secondary-strong"],
      ["Base", "--secondary-base"],
      ["Soft", "--secondary-soft"],
      ["Pale", "--secondary-pale"],
    ],
  },
  {
    title: "Danger",
    colors: [
      ["Deep", "--danger-deep"],
      ["Strong", "--danger-strong"],
      ["Base", "--danger-base"],
      ["Soft", "--danger-soft"],
      ["Pale", "--danger-pale"],
    ],
  },
  {
    title: "Neutral",
    colors: [
      ["Background", "--background"],
      ["Surface", "--surface"],
      ["Border", "--border"],
      ["Text Primary", "--text-primary"],
      ["Text Secondary", "--text-secondary"],
    ],
  },
  {
    title: "Semantic",
    colors: [
      ["Success", "--success"],
      ["Warning", "--warning"],
      ["Error", "--error"],
      ["Info", "--info"],
    ],
  },
];

const BUTTON_VARIANTS = [
  ["Primary", "primary", "바로가기"],
  ["Secondary", "secondary", "이전으로"],
  ["Ghost", "ghost", "건너뛰기"],
  ["Danger", "danger", "삭제하기"],
] as const;

const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const CARD_TONES = [
  ["Surface", "surface"],
  ["Primary Strong", "primaryStrong"],
  ["Primary Pale", "primaryPale"],
  ["Secondary Pale", "secondaryPale"],
] as const;

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>GGoGit Design System</p>
        <h1>색상과 폰트 구조</h1>
      </header>

      <div className={styles.groups}>
        {COLOR_GROUPS.map((group) => (
          <section className={styles.group} key={group.title}>
            <h2>{group.title}</h2>
            <div className={styles.swatches}>
              {group.colors.map(([label, token]) => (
                <article className={styles.swatch} key={token}>
                  <div
                    className={styles.preview}
                    style={{ backgroundColor: `var(${token})` }}
                  />
                  <div className={styles.meta}>
                    <strong>{label}</strong>
                    <code>{token}</code>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className={styles.fontSection}>
        <h2>Font Roles</h2>
        <div className={styles.fontSamples}>
          <article className={styles.fontSample}>
            <p className={styles.fontLabel}>Pretendard / 기본 UI</p>
            <p className={styles.sansSample}>
              꼬깃은 Git 그래프를 직접 만지며 배우는 퍼즐 학습 게임입니다.
            </p>
          </article>
          <article className={styles.fontSample}>
            <p className={styles.fontLabel}>학교안심 그림일기 / 캐릭터 대사</p>
            <p className={styles.characterSample}>
              괜찮아, 꼬깃꼬깃 접혀도 히스토리는 남아!
            </p>
          </article>
          <article className={styles.fontSample}>
            <p className={styles.fontLabel}>Cascadia Code / 터미널</p>
            <code className={styles.codeSample}>git commit -m &quot;first commit&quot;</code>
          </article>
        </div>
      </section>

      <section className={styles.buttonSection}>
        <h2>Button</h2>
        <div className={styles.buttonSamples}>
          {BUTTON_VARIANTS.map(([label, variant, text]) => (
            <article className={styles.buttonSample} key={variant}>
              <h3>{label}</h3>
              <div className={styles.buttonSizeGrid}>
                {BUTTON_SIZES.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    {text}
                  </Button>
                ))}
              </div>
              <div className={styles.buttonStateGrid}>
                <Button variant={variant} size="md">
                  Default
                </Button>
                <Button variant={variant} size="md" selected>
                  Selected
                </Button>
                <Button variant={variant} size="md" disabled>
                  Disabled
                </Button>
                <Button variant={variant} size="md" loading>
                  Loading
                </Button>
              </div>
              <div className={styles.buttonIconGrid}>
                <Button
                  variant={variant}
                  size="md"
                  leftIcon={<ArrowLeft />}
                >
                  이전으로
                </Button>
                <Button
                  variant={variant}
                  size="md"
                  rightIcon={<ArrowRight />}
                >
                  바로가기
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cardSection}>
        <h2>Card</h2>
        <div className={styles.cardSamples}>
          {CARD_TONES.map(([label, tone]) => (
            <Card
              id={`card-sample-${tone}`}
              key={tone}
              title={label}
              tone={tone}
              headerAction={<span>Action</span>}
            >
              <p className={styles.cardSampleText}>
                꼬깃 카드의 제목, 내용, 배경 톤, 반경, 패딩 토큰을 확인합니다.
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.paginationSection}>
        <h2>Pagination</h2>
        <div className={styles.paginationSample}>
          <Pagination
            ariaLabel="페이지네이션 샘플"
            currentPage={3}
            getPageHref={(page) => `#page-${page}`}
            totalPages={5}
          />
        </div>
      </section>
    </main>
  );
}
