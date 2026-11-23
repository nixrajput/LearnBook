import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChapterContent } from "@/components/reader/chapter-content";

// ChapterContent wraps the async MDXRemote server component; render that child directly.
async function render(rawContent: string, plainMarkdown: boolean) {
  const wrapper = ChapterContent({ rawContent, plainMarkdown }) as ReactElement<{
    children: ReactElement<object>;
  }>;
  const mdx = wrapper.props.children;
  const content = await (mdx.type as (props: object) => Promise<ReactElement>)(mdx.props);
  return renderToStaticMarkup(content);
}

const hostile =
  'Intro\n\n<script>alert(1)</script>\n\n<iframe srcDoc="<b>x</b>" />\n\n**bold** text\n';

describe("ChapterContent", () => {
  it("drops raw HTML from extracted upload content", async () => {
    const html = await render(hostile, true);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<iframe");
    expect(html).toMatch(/<strong[^>]*>bold<\/strong>/);
  });

  it("runs the same raw HTML when content is parsed as MDX", async () => {
    expect(await render(hostile, false)).toContain("<script>alert(1)</script>");
  });

  it("keeps MDX for authored course content", async () => {
    const html = await render("Intro\n\n<details>more</details>\n", false);
    expect(html).toContain("<details>");
  });
});
