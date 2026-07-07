"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";

import { updateUserProfile, updateUserProfileAvatar } from "@/features/profile";
import type { UserProfile } from "@/entities/profile";
import { useCurrentUserStore } from "@/entities/user";
import { playSuccessSound } from "@/shared/lib/sound/soundPlayer";
import { useSoundStore } from "@/shared/model/sound/soundStore";
import { Button } from "@/shared/ui/button";
import { ggoggoSeal, ggoggoSmile } from "@/assets/mascot";

import styles from "./ProfileEditableFields.module.css";

interface ProfileEditableFieldsProps {
  userProfile: UserProfile;
  canEdit: boolean;
}

export default function ProfileEditableFields({
  userProfile,
  canEdit,
}: ProfileEditableFieldsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [bio, setBio] = useState(userProfile.bio);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [isSavingAvatar, startSavingAvatar] = useTransition();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const updateCurrentUser = useCurrentUserStore(
    (state) => state.updateCurrentUser,
  );
  const soundSettings = useSoundStore((state) => state.soundSettings);
  const avatarImage = avatarUrl ?? ggoggoSmile;

  const handleAvatarButtonClick = () => {
    if (!canEdit) {
      return;
    }

    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    event.target.value = "";
    setErrorMessage(null);

    startSavingAvatar(async () => {
      const result = await updateUserProfileAvatar(formData);

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setAvatarUrl(result.data.avatarUrl);
      updateCurrentUser({ avatarUrl: result.data.avatarUrl });
      playSuccessSound(soundSettings);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startSavingProfile(async () => {
      const result = await updateUserProfile({ name, bio });

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setName(result.data.name);
      setBio(result.data.bio);
      updateCurrentUser(result.data);
      setIsEditing(false);
      playSuccessSound(soundSettings);
    });
  };

  return (
    <>
      <div className={styles.titleRow}>
        <h1>{canEdit ? "내 정보" : "프로필"}</h1>
        {canEdit ? (
          <Button
            type="button"
            className={styles.editButton}
            disabled={isSavingProfile || isSavingAvatar}
            onClick={() => setIsEditing((current) => !current)}
            size="sm"
            variant="secondary"
          >
            {isEditing ? "취소" : "수정"}
          </Button>
        ) : null}
      </div>

      {canEdit && isEditing ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.profileRow}>
            <label className={styles.field}>
              <span className={styles.label}>이름</span>
              <input
                type="text"
                value={name}
                className={styles.input}
                aria-label="이름"
                disabled={isSavingProfile}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <button
              type="button"
              className={styles.avatarButton}
              aria-label="프로필 사진 수정"
              disabled={isSavingProfile || isSavingAvatar}
              onClick={handleAvatarButtonClick}
            >
              <Image
                src={avatarImage}
                alt=""
                fill
                sizes="96px"
                className={styles.avatarImage}
              />
              <Camera
                size={28}
                className={styles.avatarEditIcon}
                aria-hidden="true"
              />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={styles.avatarInput}
              onChange={handleAvatarChange}
            />
          </div>
          <label className={styles.field}>
            <span className={styles.label}>소개</span>
            <textarea
              rows={5}
              value={bio}
              className={styles.textarea}
              aria-label="바이오"
              disabled={isSavingProfile}
              onChange={(event) => setBio(event.target.value)}
            />
          </label>
          {errorMessage ? (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          ) : null}
          <Button
            type="submit"
            className={styles.button}
            disabled={isSavingProfile || isSavingAvatar}
            loading={isSavingProfile}
          >
            저장
          </Button>
        </form>
      ) : (
        <section className={styles.profileCard} aria-label="프로필 정보">
          <div className={styles.profileRow}>
            <div className={styles.profileSummary}>
              <span className={styles.label}>이름</span>
              <p className={styles.profileName}>{name}</p>
            </div>
            <div className={styles.avatarPreview}>
              <Image
                src={avatarImage}
                alt={`${name} 프로필 사진`}
                fill
                sizes="96px"
                className={styles.avatarImage}
              />
            </div>
          </div>
          <div className={styles.bioSection}>
            <span className={styles.label}>소개</span>
            <p className={styles.bioText}>{bio}</p>
          </div>
          <div className={styles.statsSection}>
            <span className={styles.label}>학습 기록</span>
            <div className={styles.tableWrap}>
              <table className={styles.statTable}>
                <thead>
                  <tr>
                    <th scope="col">푼 문제수</th>
                    <th scope="col">맞춘 문제수</th>
                    <th scope="col">틀린 문제수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{userProfile.quizStats.solvedCount}문제</td>
                    <td>{userProfile.quizStats.correctCount}문제</td>
                    <td>{userProfile.quizStats.wrongCount}문제</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.statsSection}>
            <span className={styles.label}>활동 정보</span>
            <div className={styles.tableWrap}>
              <table className={styles.statTable}>
                <thead>
                  <tr>
                    <th scope="col">연속학습</th>
                    <th scope="col">보유 콩</th>
                    <th scope="col">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {userProfile.activityStats.currentStreakDays}일 (
                      {userProfile.activityStats.bestStreakDays}일)
                    </td>
                    <td>
                      {userProfile.activityStats.currentBeans}개 (
                      {userProfile.activityStats.totalBeans}개)
                    </td>
                    <td>{userProfile.joinedAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.certificate}>
            <p className={styles.certificateText}>
              상기 유저는 꼬깃 커뮤니티의 일원으로서 Git 학습에 최선을 다할 것을
              약속합니다.
            </p>
            <div className={styles.certificateFooter}>
              <time className={styles.joinedAt}>{userProfile.joinedAt}</time>
              <Image
                src={ggoggoSeal}
                alt="꼬꼬 인증 도장"
                width={92}
                className={styles.sealImage}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
