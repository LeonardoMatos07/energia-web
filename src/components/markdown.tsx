import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/**
 * Renders report Markdown safely: raw HTML is not parsed (react-markdown default) and the
 * resulting tree is sanitized with the GitHub schema (no scripts, no `javascript:` links).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-a:text-[var(--color-accent)] prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
