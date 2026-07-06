import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { SoundLink } from "@/shared/ui/sound-link";

import styles from "./Pagination.module.css";

interface PaginationProps {
  ariaLabel: string;
  className?: string;
  currentPage: number;
  getPageHref: (page: number) => string;
  totalPages: number;
}

const clampPage = (page: number, totalPages: number) =>
  Math.min(Math.max(page, 1), totalPages);

export default function Pagination({
  ariaLabel,
  className,
  currentPage,
  getPageHref,
  totalPages,
}: PaginationProps) {
  const pageCount = Math.max(totalPages, 1);
  const activePage = clampPage(currentPage, pageCount);
  const previousPage = clampPage(activePage - 1, pageCount);
  const nextPage = clampPage(activePage + 1, pageCount);
  const paginationClassName = [styles.pagination, className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={paginationClassName} aria-label={ariaLabel}>
      <SoundLink
        href={getPageHref(1)}
        className={styles.pageIconButton}
        aria-label="첫 페이지"
      >
        <ChevronsLeft size={18} aria-hidden="true" />
      </SoundLink>
      <SoundLink
        href={getPageHref(previousPage)}
        className={styles.pageIconButton}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </SoundLink>
      {/* TODO: Collapse long page ranges when boards grow beyond a small page count. */}
      {Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        const isActive = page === activePage;

        return (
          <SoundLink
            key={page}
            href={getPageHref(page)}
            className={isActive ? styles.activePageButton : styles.pageButton}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </SoundLink>
        );
      })}
      <SoundLink
        href={getPageHref(nextPage)}
        className={styles.pageIconButton}
        aria-label="다음 페이지"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </SoundLink>
      <SoundLink
        href={getPageHref(pageCount)}
        className={styles.pageIconButton}
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={18} aria-hidden="true" />
      </SoundLink>
    </nav>
  );
}
