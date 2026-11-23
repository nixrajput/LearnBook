import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getMDXComponents } from "@/components/shared/mdx-components";
import { cn } from "@/lib/utils/cn";

interface ChapterContentProps {
  rawContent: string;
  /** Text extracted from an uploaded file or imported page: parse as plain Markdown, never MDX. */
  plainMarkdown?: boolean;
  fontSize?: number;
  lineWidth?: string;
  fontFamily?: string;
}

const LINE_WIDTH_CLASS: Record<string, string> = {
  sm: "max-w-[600px]",
  md: "max-w-[720px]",
  lg: "max-w-[860px]",
  xl: "max-w-[1000px]",
};

const FONT_FAMILY_CLASS: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export function ChapterContent({
  rawContent,
  plainMarkdown = false,
  fontSize = 16,
  lineWidth = "md",
  fontFamily = "sans",
}: ChapterContentProps) {
  const components = getMDXComponents();

  return (
    <div
      className={cn(
        "prose prose-neutral mx-auto w-full min-w-0 overflow-x-hidden dark:prose-invert prose-code:before:hidden prose-code:after:hidden",
        LINE_WIDTH_CLASS[lineWidth] ?? "max-w-[720px]",
        FONT_FAMILY_CLASS[fontFamily] ?? "font-sans",
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <MDXRemote
        source={rawContent}
        options={{
          mdxOptions: {
            format: plainMarkdown ? "md" : "mdx",
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
        components={components}
      />
    </div>
  );
}
