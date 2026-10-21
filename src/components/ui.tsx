import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
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
    <header className="py-10 sm:py-14">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl">{title}</h1>
      {children ? (
        <div className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-ink-2)] sm:text-lg sm:leading-8">
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
}: {
  title: string;
  id?: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="py-7 sm:py-9">
      <h2 id={id} className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-3xl text-sm text-[var(--color-ink-2)]">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: ReactNode;
}) {
  return (
      <div className="rounded-2xl border border-[var(--color-grid)] bg-[var(--color-surface)] p-5 shadow-[0_2px_8px_rgba(25,55,43,0.04)] sm:p-6">
      <dt className="text-sm text-[var(--color-ink-2)]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</dd>
      {note ? <dd className="mt-1 text-xs text-[var(--color-muted)]">{note}</dd> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">{children}</dl>;
}

/** Friendly message when the API is unreachable or returns nothing. */
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
      className="rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-[var(--color-ink-2)]"
    >
      <p className="font-semibold text-[var(--color-ink)]">{title}</p>
      <p className="mt-1 text-sm">
        {children ??
          "Não conseguimos carregar os dados agora. Tente novamente em alguns minutos — a página é atualizada automaticamente quando novos dados do ONS são processados."}
      </p>
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border-l-4 border-[var(--color-accent)] bg-[#eef4fc] p-4 text-sm text-[var(--color-ink)]">
      {children}
    </aside>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-strong)]">
      {children}
    </Link>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-line)] bg-white px-2.5 py-0.5 text-xs font-medium text-[var(--color-ink-2)]">
      {children}
    </span>
  );
}
