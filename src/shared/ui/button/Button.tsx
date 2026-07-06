import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  loading?: boolean;
  rightIcon?: ReactNode;
  selected?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const getLoadingLabel = (children: ReactNode, ariaLabel?: string) => {
  if (ariaLabel) {
    return ariaLabel;
  }

  return typeof children === "string" ? children : undefined;
};

export default function Button({
  children,
  className,
  disabled = false,
  leftIcon,
  loading = false,
  rightIcon,
  selected = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const buttonClassName = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      aria-label={loading ? getLoadingLabel(children, props["aria-label"]) : props["aria-label"]}
      aria-pressed={selected || undefined}
      className={buttonClassName}
      data-loading={loading || undefined}
      data-selected={selected || undefined}
      disabled={isDisabled}
      type={type}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {leftIcon && (
            <span className={styles.icon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <span className={styles.label}>{children}</span>
          {rightIcon && (
            <span className={styles.icon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
