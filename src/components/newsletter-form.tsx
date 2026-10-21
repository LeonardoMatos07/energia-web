"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { initialNewsletterState, type NewsletterFormState } from "@/lib/newsletter";

type Action = (prev: NewsletterFormState, formData: FormData) => Promise<NewsletterFormState>;

/** Newsletter signup: e-mail only, explicit LGPD consent, double opt-in by e-mail. */
export function NewsletterForm({ action, origem = "portal" }: { action: Action; origem?: string }) {
  const [state, formAction, pending] = useActionState(action, initialNewsletterState);
  const id = useId();

  return (
    <form
      action={formAction}
      className="relative rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)] p-4 sm:p-6"
      noValidate
    >
      <h2 className="text-lg font-semibold">Receba o resumo mensal</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-2)]">
        Um e-mail por mês quando os dados do ONS são atualizados. Sem propaganda.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Seu e-mail
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com.br"
          className="min-w-0 flex-1 rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-base"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Inscrever"}
        </button>
      </div>

      <div className="mt-3 flex items-start gap-2 text-sm">
        <input
          id={`${id}-consent`}
          name="consentimento"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0"
        />
        <label htmlFor={`${id}-consent`} className="text-[var(--color-ink-2)]">
          Concordo em receber e-mails do Monitor de Curtailment e com o uso do meu e-mail apenas
          para esse fim, conforme a LGPD. Posso cancelar a qualquer momento pelo link em cada e-mail.{" "}
          <Link href="/metodologia#privacidade" className="text-[var(--color-accent)] underline">
            Como tratamos seus dados
          </Link>
          .
        </label>
      </div>

      {/* Honeypot field, hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Não preencha</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="origem" value={origem} />

      <p
        role="status"
        aria-live="polite"
        className={`mt-3 text-sm ${
          state.status === "error"
            ? "text-[#a3281f]"
            : state.status === "success"
              ? "text-[#006300]"
              : "sr-only"
        }`}
      >
        {state.message}
      </p>
    </form>
  );
}
