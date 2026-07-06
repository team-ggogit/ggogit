import type { ReactNode } from "react";

import styles from "./Card.module.css";

interface CardProps {
  id: string;
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  tone?: "surface" | "primaryStrong" | "primaryPale" | "secondaryPale";
}

export default function Card({
  id,
  title,
  headerAction,
  children,
  footer,
  className,
  tone = "surface",
}: CardProps) {
  const titleId = `${id}-title`;
  const cardClassName = [styles.card, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      className={cardClassName}
      aria-labelledby={titleId}
    >
      <div className={styles.cardHeader}>
        <h2 id={titleId}>{title}</h2>
        {headerAction && (
          <div className={styles.headerAction}>{headerAction}</div>
        )}
      </div>
      <div className={styles.cardContent}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </section>
  );
}
