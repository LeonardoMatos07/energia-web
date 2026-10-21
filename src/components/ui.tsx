import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "figure" | "section";
}) {
  return (
    <Tag className={`border-grid bg-surface shadow-card rounded-2xl border ${className}`}>
      {children}
    </Tag>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="pt-10 pb-6 sm:pt-14 sm:pb-8">
      {eyebrow ? (
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 max-w-4xl text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {children ? (
        <div className="text-ink-2 mt-4 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8">
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  id,
  children,
  description,
  action,
}: {
  title: string;
  id?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {description ? <p className="text-ink-2 mt-1 max-w-3xl text-sm">{description}</p> : null}
        </div>
        {action ? <div className="text-sm">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        highlight
          ? "bg-accent text-on-accent border-transparent"
          : "border-grid bg-surface shadow-card"
      }`}
    >
      <dt className={`text-sm ${highlight ? "opacity-85" : "text-ink-2"}`}>{label}</dt>
      <dd className="tabular font-display mt-1 text-xl font-bold tracking-tight whitespace-nowrap sm:text-2xl xl:text-[1.75rem]">
        {value}
      </dd>
      {note ? (
        <dd className={`mt-1 text-xs ${highlight ? "opacity-80" : "text-muted"}`}>{note}</dd>
      ) : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</dl>;
}

export function DataUnavailable({
  title = "Dados indisponíveis no momento",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="border-line bg-surface text-ink-2 rounded-2xl border border-dashed p-6"
    >
      <p className="text-ink font-semibold">{title}</p>
      <p className="mt-1 text-sm">
        {children ??
          "Não conseguimos carregar os dados agora. Tente novamente em alguns minutos — a página é atualizada automaticamente quando novos dados do ONS são processados."}
      </p>
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <aside className="bg-accent-soft text-ink flex gap-3 rounded-2xl p-4 text-sm leading-6">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="fill-accent-strong mt-0.5 size-5 shrink-0"
      >
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 3.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM11.2 14.5H8.8v-1.2h.6V10h-.6V8.8h1.8v4.5h.6v1.2Z" />
      </svg>
      <div>{children}</div>
    </aside>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-accent hover:text-accent-strong underline">
      {children}
    </Link>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="border-line bg-surface text-ink-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}
