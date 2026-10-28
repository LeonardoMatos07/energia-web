"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setMemberNewsletter } from "@/app/newsletter/actions";

/** The monthly e-mail for someone who is already signed in: one click, no form, no e-mail to
 * confirm. `hero` is the home page's call to action; `card` sits at the end of a page. */
export function MemberNewsletter({
  enabled: initial,
  variant = "hero",
}: {
  enabled: boolean;
  variant?: "hero" | "card";
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setMemberNewsletter(next);
      if (result.ok) {
        setEnabled(result.enabled);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  const button =
    "rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-wait";
  const message = error ? (
    <p role="alert" className="text-danger text-sm">
      {error}
    </p>
  ) : null;

  if (enabled) {
    const done = (
      <p role="status" className="text-ink flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true" className="text-accent">
          ✓
        </span>
        Você habilitou a newsletter mensal.
      </p>
    );
    if (variant === "card") {
      return <div className="border-grid bg-accent-soft rounded-2xl border p-5 sm:p-6">{done}</div>;
    }
    return done;
  }

  const status = (
    <p role="status" className="text-ink-2 text-sm">
      Uma newsletter por mês, grátis, no seu e-mail cadastrado.
    </p>
  );
  const action = (
    <button
      type="button"
      disabled={pending}
      onClick={() => toggle(true)}
      data-track="landing.member_newsletter"
      className={`${button} bg-accent text-on-accent shadow-card hover:opacity-90`}
    >
      {pending ? "Salvando…" : "Receber a newsletter mensal"}
    </button>
  );

  if (variant === "card") {
    return (
      <div className="border-grid bg-accent-soft flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Newsletter mensal</h2>
          {status}
          {message}
        </div>
        {action}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-3">{action}</div>
      {status}
      {message}
    </div>
  );
}
