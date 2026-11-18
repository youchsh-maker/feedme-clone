"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  CopyIcon,
  DownloadIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  buildExportText,
  buildFileName,
  buildLlmTarget,
  buildLlmText,
  type LlmService,
} from "./export";
import { MarkdownView } from "./markdown-view";

type Page = { url: string; title: string; author: string; markdown: string };
type Status =
  | { kind: "empty" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "result"; page: Page };

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];
const CUSTOM = "custom";

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function Converter() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "empty" });
  const [selected, setSelected] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const loading = status.kind === "loading";

  function resetPrompt() {
    setSelected(null);
    setCustomPrompt("");
  }

  async function convert(e: React.FormEvent) {
    e.preventDefault();
    const target = url.trim();
    if (!isHttpUrl(target)) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      resetPrompt();
      setStatus({ kind: "result", page: { url: target, ...data } });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          (err instanceof Error && err.message) ||
          "페이지를 가져오지 못했습니다.",
      });
    }
  }

  function clearAll() {
    setUrl("");
    setUrlError(false);
    setStatus({ kind: "empty" });
    resetPrompt();
  }

  const page = status.kind === "result" ? status.page : null;
  const exportText = page ? buildExportText(page) : "";
  const prompt = selected === CUSTOM ? customPrompt : (selected ?? "");

  async function copy() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast("Markdown을 클립보드에 복사했습니다");
  }

  function download() {
    if (!page) return;
    const name = buildFileName(page.title, page.url);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([exportText], { type: "text/markdown" }),
    );
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("파일을 저장했습니다", { description: name });
  }

  async function openIn(service: LlmService) {
    const text = buildLlmText(prompt, exportText);
    const target = buildLlmTarget(service, text);
    // 클릭 직후 동기적으로 열어야 팝업 차단에 걸리지 않는다.
    window.open(target.url, "_blank", "noopener");
    await navigator.clipboard.writeText(text);
    if (target.prefilled) {
      toast(`${service} 새 채팅을 새 탭에서 열었습니다`, {
        description:
          "입력란에 내용이 미리 채워져 있습니다. 클립보드에도 복사해 두었습니다.",
      });
    } else {
      toast("클립보드에 복사했습니다. 붙여넣기(Ctrl+V)하세요", {
        description: `글이 길어서 ${service} 새 채팅만 새 탭에서 열었습니다.`,
      });
    }
  }

  return (
    <>
      <form noValidate onSubmit={convert} className="flex flex-col gap-1.5">
        <label htmlFor="url" className="text-sm font-medium">
          페이지 URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://example.com/article"
              value={url}
              aria-invalid={urlError}
              className="pr-9"
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(false);
              }}
            />
            {url && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="지우기"
                title="지우기"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={clearAll}
              >
                <XIcon />
              </Button>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            {loading ? "변환 중…" : "변환"}
          </Button>
        </div>
        {urlError && (
          <p className="text-[0.8125rem] text-destructive">
            올바른 URL 형식이 아닙니다. http:// 또는 https://로 시작하는 주소를
            넣어 주세요.
          </p>
        )}
      </form>

      {status.kind === "empty" && (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-muted-foreground">
          <strong className="mb-1 block font-medium text-foreground">
            아직 변환한 페이지가 없습니다
          </strong>
          기사, 블로그 글, 문서 페이지의 URL을 넣어 보세요.
        </div>
      )}

      {status.kind === "loading" && (
        <Card aria-busy="true">
          <CardHeader className="gap-2.5">
            <Skeleton className="h-5.5 w-3/5" />
            <Skeleton className="h-3.5 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-10/12" />
          </CardContent>
        </Card>
      )}

      {status.kind === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>페이지를 가져오지 못했습니다</AlertTitle>
          <AlertDescription>
            {status.message} 주소를 확인한 뒤 다시 시도해 주세요.
          </AlertDescription>
        </Alert>
      )}

      {page && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="text-[0.8125rem] font-medium">
                LLM으로 보낼 때 앞에 붙일 프롬프트{" "}
                <span className="font-normal text-muted-foreground">
                  (선택)
                </span>
              </p>
              <ToggleGroup
                variant="outline"
                spacing={1.5}
                className="flex-wrap"
                aria-label="프롬프트"
                value={selected ? [selected] : []}
                onValueChange={(v) => setSelected(v[0] ?? null)}
              >
                {[...PRESETS, CUSTOM].map((p) => (
                  <ToggleGroupItem
                    key={p}
                    value={p}
                    className="rounded-full px-3 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                  >
                    {p === CUSTOM ? "직접 입력" : p}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {selected === CUSTOM && (
                <div className="flex flex-col gap-1.5">
                  <Input
                    autoFocus
                    aria-label="직접 입력 프롬프트"
                    placeholder="예: 핵심 주장 세 가지와 반론을 정리해줘"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  <p className="text-[0.8125rem] text-muted-foreground">
                    이번 한 번만 쓰고 저장하지 않습니다.
                  </p>
                </div>
              )}
            </CardContent>
            <CardContent className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" onClick={copy}>
                <CopyIcon />
                {copied ? "복사됨" : "복사하기"}
              </Button>
              <Button variant="outline" onClick={download}>
                <DownloadIcon />
                .md 다운로드
              </Button>
              <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
                {(["ChatGPT", "Claude"] as const).map((s) => (
                  <Button
                    key={s}
                    className="flex-1 sm:flex-none"
                    onClick={() => openIn(s)}
                  >
                    {s}로 열기
                    <ArrowUpRightIcon />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1 border-b">
              <h2 className="text-xl leading-snug font-semibold tracking-tight">
                {page.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8125rem] text-muted-foreground">
                {page.author && (
                  <>
                    <span>{page.author}</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all underline underline-offset-3"
                >
                  {page.url}
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <MarkdownView markdown={page.markdown} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
