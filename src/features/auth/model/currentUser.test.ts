import type { JwtPayload } from "@supabase/supabase-js";
import { describe, it, expect } from "vitest";

import {
  getCurrentUserAvatarUrl,
  getCurrentUserName,
  getUserMetadataName,
  normalizeAvatarUrl,
} from "./currentUser";

// 테스트에서 필요한 필드만 담은 claims를 만든다.
const makeClaims = (payload: Partial<JwtPayload>) =>
  payload as unknown as JwtPayload;

describe("getUserMetadataName", () => {
  it("metadata가 없으면 null", () => {
    expect(getUserMetadataName(null)).toBeNull();
    expect(getUserMetadataName(undefined)).toBeNull();
  });

  it("후보가 하나도 없으면 null", () => {
    expect(getUserMetadataName({})).toBeNull();
  });

  it("name을 가장 먼저 사용한다", () => {
    expect(getUserMetadataName({ name: "철수", full_name: "김철수" })).toBe(
      "철수",
    );
  });

  it("앞 후보가 빈 문자열이면 다음 후보로 넘어간다", () => {
    expect(getUserMetadataName({ name: "", full_name: "백업이름" })).toBe(
      "백업이름",
    );
  });

  it("preferred_username까지 fallback 한다", () => {
    expect(getUserMetadataName({ preferred_username: "octocat" })).toBe(
      "octocat",
    );
  });
});

describe("getCurrentUserName", () => {
  it("claims가 없으면 Guest", () => {
    expect(getCurrentUserName(null)).toBe("Guest");
  });

  it("메타데이터 이름을 우선 사용한다", () => {
    expect(getCurrentUserName(makeClaims({ user_metadata: { name: "철수" } }))).toBe(
      "철수",
    );
  });

  it("이름이 없으면 이메일로 fallback 한다", () => {
    expect(
      getCurrentUserName(
        makeClaims({ user_metadata: {}, email: "user@example.com" }),
      ),
    ).toBe("user@example.com");
  });

  it("이름도 이메일도 없으면 Guest", () => {
    expect(getCurrentUserName(makeClaims({ user_metadata: {} }))).toBe("Guest");
  });
});

describe("normalizeAvatarUrl", () => {
  it("null/undefined는 null", () => {
    expect(normalizeAvatarUrl(null)).toBeNull();
    expect(normalizeAvatarUrl(undefined)).toBeNull();
  });

  it("http를 https로 승격한다", () => {
    expect(normalizeAvatarUrl("http://img.example.com/a.png")).toBe(
      "https://img.example.com/a.png",
    );
  });

  it("이미 https면 그대로 둔다", () => {
    expect(normalizeAvatarUrl("https://img.example.com/a.png")).toBe(
      "https://img.example.com/a.png",
    );
  });
});

describe("getCurrentUserAvatarUrl", () => {
  it("claims가 없으면 null", () => {
    expect(getCurrentUserAvatarUrl(null)).toBeNull();
  });

  it("avatar_url을 https로 정규화해 반환한다", () => {
    expect(
      getCurrentUserAvatarUrl(
        makeClaims({ user_metadata: { avatar_url: "http://i/a.png" } }),
      ),
    ).toBe("https://i/a.png");
  });

  it("avatar_url이 없으면 picture로 fallback 한다", () => {
    expect(
      getCurrentUserAvatarUrl(
        makeClaims({ user_metadata: { picture: "https://p/b.png" } }),
      ),
    ).toBe("https://p/b.png");
  });
});
