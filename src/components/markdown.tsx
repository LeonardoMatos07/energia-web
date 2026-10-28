import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { ReportChart } from "@/components/report-chart";
import { parseChartSpec } from "@/lib/report-chart";

const CHART_CLASS = "language-chart";

function text(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(text).join("");
  return "";
}

/** A fenced `chart` block is drawn as a chart; any other code block stays code. */
function Pre({ children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    if (children.props.className?.split(" ").includes(CHART_CLASS)) {
      const spec = parseChartSpec(text(children.props.children));
      if (spec) return <ReportChart spec={spec} />;
    }
  }
  return <pre {...rest}>{children}</pre>;
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-site prose-table:text-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{ pre: Pre }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
