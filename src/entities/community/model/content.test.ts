import { describe, it, expect } from "vitest";

import type { CommunityPost } from "./types";
import {
  createCommunityParagraphBlocks,
  getCommunityFirstParagraph,
} from "./content";

// content 블록만 필요한 테스트라 나머지 필드는 최소화한다.
const makePost = (content: CommunityPost["content"]) =>
  ({ content }) as CommunityPost;

describe("getCommunityFirstParagraph", () => {
  it("첫 문단 블록의 텍스트를 반환한다", () => {
    const post = makePost([
      { kind: "paragraph", text: "첫 문단" },
      { kind: "paragraph", text: "둘째 문단" },
    ]);

    expect(getCommunityFirstParagraph(post)).toBe("첫 문단");
  });

  it("앞에 이미지가 있어도 첫 '문단'을 찾는다", () => {
    const post = makePost([
      { kind: "image", image: {} as never, alt: "" },
      { kind: "paragraph", text: "이미지 다음 문단" },
    ]);

    expect(getCommunityFirstParagraph(post)).toBe("이미지 다음 문단");
  });

  it("문단이 하나도 없으면 빈 문자열", () => {
    expect(getCommunityFirstParagraph(makePost([]))).toBe("");
  });
});

describe("createCommunityParagraphBlocks", () => {
  it("텍스트를 문단 블록 하나로 감싼다", () => {
    expect(createCommunityParagraphBlocks("안녕")).toEqual([
      { kind: "paragraph", text: "안녕" },
    ]);
  });
});
