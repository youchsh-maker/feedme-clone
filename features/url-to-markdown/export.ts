export type LlmService = "ChatGPT" | "Claude";

// 미리 채우기에 쓰는 인코딩된 주소 전체 길이 상한(추정값)
export const PREFILL_LIMIT = 8000;

const BASES: Record<LlmService, string> = {
  ChatGPT: "https://chatgpt.com/?q=",
  Claude: "https://claude.ai/new?q=",
};

// 복사·다운로드 내용: 제목과 원본 URL을 맨 위에 붙인 Markdown 원문
export function buildExportText(page: {
  title: string;
  url: string;
  markdown: string;
}) {
  return `# ${page.title}\n\n원본: ${page.url}\n\n${page.markdown}`;
}

// LLM으로 넘길 텍스트: 프롬프트가 있으면 "프롬프트 + 빈 줄 + 본문"
export function buildLlmText(prompt: string, exportText: string) {
  const p = prompt.trim();
  return p ? `${p}\n\n${exportText}` : exportText;
}

// 짧으면 미리 채우기 주소, 길면 새 채팅만 여는 주소
export function buildLlmTarget(service: LlmService, text: string) {
  const full = BASES[service] + encodeURIComponent(text);
  if (full.length <= PREFILL_LIMIT) return { url: full, prefilled: true };
  return { url: BASES[service].split("?")[0], prefilled: false };
}

export function buildFileName(title: string, url: string) {
  const base = title
    .replace(/[\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  let fallback = "page";
  try {
    fallback = new URL(url).hostname;
  } catch {}
  return `${base || fallback}.md`;
}
