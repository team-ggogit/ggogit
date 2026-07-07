"use client";

import Image from "next/image";

import type { MiniQuizStage } from "@/entities/mini-quiz";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { SoundLink } from "@/shared/ui/sound-link";
import { ggoggoAdventure } from "@/assets/mascot";

import styles from "./StageStartControl.module.css";

interface StageStartModalProps {
  chapterNumber: number;
  isLocked: boolean;
  onClose: () => void;
  stage: MiniQuizStage;
  stageNumber: number;
  startButtonLabel: string;
  startHref: string;
}

export default function StageStartModal({
  chapterNumber,
  isLocked,
  onClose,
  stage,
  stageNumber,
  startButtonLabel,
  startHref,
}: StageStartModalProps) {
  return (
    <Modal
      title={isLocked ? "아직 열리지 않았어요" : "스테이지를 시작해요"}
      onClose={onClose}
    >
      <div className={styles.stageModalContent}>
        <div className={styles.stageModalText}>
          <p className={styles.stageModalStep}>
            Chapter {chapterNumber} · Stage {stageNumber}
          </p>
          <h3>{stage.title}</h3>
        </div>
        <Image
          src={ggoggoAdventure}
          alt=""
          width={180}
          height={150}
          className={styles.stageModalImage}
        />
        <p className={styles.stageModalDescription}>{stage.description}</p>
        <div className={styles.stageModalTableWrap}>
          <table className={styles.stageModalTable}>
            <thead>
              <tr>
                <th scope="col">핵심 명령어</th>
                <th scope="col">문제 수</th>
                <th scope="col">클리어 조건</th>
                <th scope="col">에너지</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stage.command}</td>
                <td>5문제</td>
                <td>3문제</td>
                <td>번개 3개</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.stageModalPrompt}>
          {isLocked
            ? "이전 스테이지를 먼저 완료하면 열려요."
            : "준비되면 바로 시작해요."}
        </p>
        <div className={styles.stageModalActions}>
          <Button
            className={styles.stageModalGhostButton}
            onClick={onClose}
            variant="secondary"
          >
            닫기
          </Button>
          {!isLocked && (
            <SoundLink
              className={styles.stageModalStartButton}
              href={startHref}
            >
              {startButtonLabel}
            </SoundLink>
          )}
        </div>
      </div>
    </Modal>
  );
}
