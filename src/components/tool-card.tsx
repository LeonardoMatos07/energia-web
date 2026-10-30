import Link from "next/link";
import type { Tool } from "@/lib/tools";

/** Card of a free tool, with the forecasting model highlighted when the tool has one. */
export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="border-grid bg-surface shadow-card hover:border-accent focus-visible:outline-accent group flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="bg-accent-soft text-accent-strong flex size-10 items-center justify-center rounded-xl">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={tool.icon} />
        </svg>
      </span>
      <span className="text-lg font-semibold group-hover:underline">{tool.title}</span>
      <span className="text-ink-2 text-sm leading-6">{tool.description}</span>
      {tool.model ? (
        <span className="border-accent bg-accent-soft text-accent-strong mt-auto rounded-xl border px-3 py-2 text-sm">
          <span className="block text-xs font-semibold tracking-wide uppercase">Modelo</span>
          <span className="font-semibold">{tool.model}</span>
        </span>
      ) : null}
    </Link>
  );
}
