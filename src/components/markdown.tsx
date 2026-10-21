import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/**
 * Renders report Markdown safely: raw HTML is not parsed (react-markdown default) and the
 * resulting tree is sanitized with the GitHub schema (no scripts, no `javascript:` links).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral prose-a:text-[var(--color-accent)] prose-table:text-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
