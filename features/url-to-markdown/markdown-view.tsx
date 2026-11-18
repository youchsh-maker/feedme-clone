import type { Root, RootContent } from "mdast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function textOf(node: RootContent): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node) return (node.children as RootContent[]).map(textOf).join("");
  return "";
}

// 글머리 목록을 바로 위 번호 제목을 따른 소구분 번호(3.1, 3.2)로 보이게 표시한다.
// Markdown 원문은 바꾸지 않고 렌더링용 속성만 붙인다.
function remarkSubNumbers() {
  return (tree: Root) => {
    let section: string | null = null;
    for (const node of tree.children) {
      if (node.type === "heading" && node.depth <= 3) {
        const m = textOf(node).match(/^\s*(\d+)/);
        if (m) section = m[1];
        else if (node.depth <= 2) section = null;
      } else if (node.type === "list" && !node.ordered) {
        node.data = { ...node.data, hProperties: { className: ["sub-num"] } };
        node.children.forEach((item, i) => {
          item.data = {
            ...item.data,
            hProperties: { "data-num": section ? `${section}.${i + 1}` : `${i + 1}.` },
          };
        });
      }
    }
  };
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="prose-feedme">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkSubNumbers]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
