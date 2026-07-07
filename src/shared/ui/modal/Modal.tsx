"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  const portalRoot = typeof document === "undefined" ? null : document.body;

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="modal-title">{title}</h2>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
          >
            <X size={20} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    portalRoot,
  );
}
