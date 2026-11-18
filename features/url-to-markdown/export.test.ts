import { expect, test } from "vitest";

import {
  buildExportText,
  buildFileName,
  buildLlmTarget,
  buildLlmText,
} from "./export";

test("복사 내용은 제목과 원본 URL 뒤에 Markdown 원문을 붙인다", () => {
  expect(
    buildExportText({ title: "제목", url: "https://a.com/x", markdown: "본문" }),
  ).toBe("# 제목\n\n원본: https://a.com/x\n\n본문");
});

test("프롬프트가 없으면 본문만, 있으면 프롬프트와 빈 줄을 앞에 붙인다", () => {
  expect(buildLlmText("", "본문")).toBe("본문");
  expect(buildLlmText("  ", "본문")).toBe("본문");
  expect(buildLlmText("요약해줘", "본문")).toBe("요약해줘\n\n본문");
});

test("짧은 텍스트는 미리 채우고 긴 텍스트는 새 채팅만 연다", () => {
  const short = buildLlmTarget("Claude", "hello");
  expect(short).toEqual({
    url: "https://claude.ai/new?q=hello",
    prefilled: true,
  });
  const long = buildLlmTarget("ChatGPT", "가".repeat(2000));
  expect(long).toEqual({ url: "https://chatgpt.com/", prefilled: false });
});

test("파일 이름은 제목에서 만들고 제목이 없으면 도메인을 쓴다", () => {
  expect(buildFileName("File over: app", "https://a.com")).toBe(
    "File-over-app.md",
  );
  expect(buildFileName("", "https://stephango.com/x")).toBe("stephango.com.md");
});
