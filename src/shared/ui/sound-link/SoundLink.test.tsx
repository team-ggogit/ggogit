import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";

import { playClickSound } from "@/shared/lib/sound/soundPlayer";

import SoundLink from "./SoundLink";

vi.mock("@/shared/lib/sound/soundPlayer", () => ({
  playClickSound: vi.fn(),
}));

vi.mock("@/shared/model/sound/soundStore", () => ({
  useSoundStore: (selector: (state: { soundSettings: unknown }) => unknown) =>
    selector({ soundSettings: { muted: false, volume: 1 } }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href: _href, ...rest }: ComponentProps<"a">) => (
    <a {...rest}>{children}</a>
  ),
}));

describe("SoundLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("children을 그대로 렌더한다", () => {
    render(<SoundLink href="/next">이동</SoundLink>);
    expect(screen.getByText("이동")).toBeInTheDocument();
  });

  it("클릭하면 playClickSound가 호출된다", async () => {
    const user = userEvent.setup();
    render(<SoundLink href="/next">이동</SoundLink>);

    await user.click(screen.getByText("이동"));

    expect(playClickSound).toHaveBeenCalledTimes(1);
  });

  it("클릭하면 넘겨준 onClick도 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SoundLink href="/next" onClick={onClick}>
        이동
      </SoundLink>,
    );

    await user.click(screen.getByText("이동"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
