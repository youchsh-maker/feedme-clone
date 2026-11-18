import { ConvertError, convertUrl } from "@/features/url-to-markdown/extract";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";
  let protocol = "";
  try {
    protocol = new URL(url).protocol;
  } catch {}
  if (protocol !== "http:" && protocol !== "https:") {
    return Response.json(
      { error: "http:// 또는 https://로 시작하는 주소를 넣어 주세요." },
      { status: 400 },
    );
  }

  try {
    return Response.json(await convertUrl(url));
  } catch (e) {
    if (e instanceof ConvertError) {
      return Response.json({ error: e.message }, { status: e.status });
    }
    return Response.json(
      { error: "본문을 추출하지 못했습니다." },
      { status: 500 },
    );
  }
}
