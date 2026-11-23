import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils/cn";

export function getMDXComponents(): MDXComponents {
  return {
    h2: ({ className, children, ...props }) => (
      <h2
        className={cn(
          "group relative mb-4 mt-10 scroll-mt-24 text-2xl font-bold tracking-tight",
          className,
        )}
        {...props}
      >
        <a
          href={`#${props.id}`}
          className="absolute -left-6 hidden text-muted-foreground no-underline transition-opacity hover:text-foreground group-hover:inline-block"
          aria-hidden
        >
          #
        </a>
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }) => (
      <h3
        className={cn(
          "group relative mb-3 mt-8 scroll-mt-24 text-xl font-semibold tracking-tight",
          className,
        )}
        {...props}
      >
        <a
          href={`#${props.id}`}
          className="absolute -left-5 hidden text-muted-foreground no-underline hover:text-foreground group-hover:inline-block"
          aria-hidden
        >
          #
        </a>
        {children}
      </h3>
    ),
    h4: ({ className, children, ...props }) => (
      <h4
        className={cn("group relative mb-2 mt-6 scroll-mt-24 text-lg font-semibold", className)}
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ className, ...props }) => (
      <p className={cn("leading-7 [&:not(:first-child)]:mt-4", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-4 ml-6 list-disc space-y-1.5", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-4 ml-6 list-decimal space-y-1.5", className)} {...props} />
    ),
    li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-4 rounded-r-md border-l-4 border-primary/40 bg-muted/30 py-1 pl-4 italic text-muted-foreground",
          className,
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className={cn(
              "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.875em]",
              className,
            )}
            {...props}
          />
        );
      }
      return <code className={className} {...props} />;
    },
    pre: ({ className, children, ...props }) => (
      <pre
        className={cn(
          "my-4 overflow-x-auto rounded-lg border bg-zinc-100 p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    ),
    hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
    table: ({ className, ...props }) => (
      <div className="my-4 overflow-x-auto rounded-md border">
        <table className={cn("w-full text-sm", className)} {...props} />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn("border-b bg-muted px-4 py-2 text-left font-semibold", className)}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("border-b px-4 py-2", className)} {...props} />
    ),
    strong: ({ className, ...props }) => (
      <strong className={cn("font-semibold", className)} {...props} />
    ),
    img: ({ className, alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={cn("my-4 rounded-lg border bg-white p-2 dark:bg-zinc-900", className)}
        alt={alt ?? ""}
        loading="lazy"
        {...props}
      />
    ),
  };
}
