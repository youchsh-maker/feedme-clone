import { AuthNav } from "@/features/auth/auth-nav";
import { Converter } from "@/features/url-to-markdown/converter";
import { ThemeToggle } from "@/features/url-to-markdown/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3 pb-12 text-sm">
      <header className="flex items-center justify-between border-b py-2">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            md
          </span>
          feedme
        </div>
        <div className="flex items-center gap-2">
          <AuthNav />
          <ThemeToggle />
        </div>
      </header>
      <div>
        <h1 className="mb-1.5 text-2xl font-semibold tracking-tight max-sm:text-xl">
          웹 페이지를 Markdown으로
        </h1>
        <p className="text-muted-foreground">
          URL을 붙여넣으면 본문만 깔끔하게 뽑아 ChatGPT나 Claude로 바로 넘겨
          드립니다.
        </p>
      </div>
      <Converter />
    </main>
  );
}
