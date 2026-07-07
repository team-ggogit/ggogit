"use client";

import Image from "next/image";
import { useState } from "react";

import { playClickSound } from "@/shared/lib/sound/soundPlayer";
import { useSoundStore } from "@/shared/model/sound/soundStore";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { SoundLink } from "@/shared/ui/sound-link";
import { ggoggoPodium } from "@/assets/mascot";

import styles from "./ChallengePage.module.css";

export default function ChallengeStartControl() {
  const [isOpen, setIsOpen] = useState(false);
  const soundSettings = useSoundStore((state) => state.soundSettings);

  const openStartModal = () => {
    playClickSound(soundSettings);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        className={styles.startButton}
        onClick={openStartModal}
        size="lg"
      >
        도전 시작하기
      </Button>

      {isOpen && (
        <Modal title="오늘의 도전을 시작할까요?" onClose={() => setIsOpen(false)}>
          <div className={styles.startModalContent}>
            <Image
              src={ggoggoPodium}
              alt=""
              width={180}
              className={styles.startModalImage}
            />
            <p>
              5문제를 모두 풀면 오늘의 랭킹에 기록돼요. 준비되면 바로
              시작해요.
            </p>
            <div className={styles.startModalActions}>
              <Button
                className={styles.startModalGhostButton}
                onClick={() => setIsOpen(false)}
                variant="secondary"
              >
                닫기
              </Button>
              <SoundLink
                href="/challenge/play"
                className={styles.startModalStartButton}
              >
                시작하기
              </SoundLink>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
