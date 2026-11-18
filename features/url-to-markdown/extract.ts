import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type ConvertedPage = {
  title: string;
  author: string;
  markdown: string;
};

export class ConvertError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// 페이지를 서버에서 가져와 defuddle로 본문을 Markdown으로 추출한다.
export async function convertUrl(url: string): Promise<ConvertedPage> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; feedme/1.0; +https://github.com/)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } catch {
    throw new ConvertError("사이트에 연결하지 못했습니다.", 502);
  }
  if (!res.ok) {
    throw new ConvertError(
      `사이트가 요청을 거부했거나 응답하지 않았습니다(${res.status}).`,
      502,
    );
  }

  const html = await res.text();
  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Document, url, {
    markdown: true,
  });
  const markdown = (result.content ?? "").trim();
  if (!markdown) {
    throw new ConvertError("본문을 추출하지 못했습니다.", 422);
  }
  return {
    title: (result.title ?? "").trim() || new URL(url).hostname,
    author: (result.author ?? "").trim(),
    markdown,
  };
}
