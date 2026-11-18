import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import { MarkdownView } from "./markdown-view";

function nums(md: string) {
  const { container } = render(<MarkdownView markdown={md} />);
  return [...container.querySelectorAll("ul.sub-num > li")].map(
    (li) => (li as HTMLElement).dataset.num,
  );
}

test("글머리 목록은 바로 위 번호 제목을 따른 소구분 번호를 단다", () => {
  expect(nums("## 3. 오프라인\n\n- 가\n- 나\n- 다")).toEqual([
    "3.1",
    "3.2",
    "3.3",
  ]);
});

test("위에 번호 제목이 없으면 1., 2.로 단다", () => {
  expect(nums("## 마치며\n\n- 가\n- 나")).toEqual(["1.", "2."]);
});
