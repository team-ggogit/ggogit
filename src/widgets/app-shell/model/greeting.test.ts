import { describe, expect, it } from "vitest";

import { getAppShellGreeting } from "./greeting";

describe("getAppShellGreeting", () => {
  it("페이지의 소개문구 닉네임은 반드시 유저 닉네임과 같아야 한다.", () => {
    expect(getAppShellGreeting({ pathname: "/", name: "hello" })).toContain(
      "hello님",
    );
  });
});
