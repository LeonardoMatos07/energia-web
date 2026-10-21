"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { initialNewsletterState, type NewsletterFormState } from "@/lib/newsletter";

type Action = (prev: NewsletterFormState, formData: FormData) => Promise<NewsletterFormState>;

export function NewsletterForm({
  action,
  signupSource = "portal",
}: {
  action: Action;
  signupSource?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialNewsletterState);
  const id = useId();

  return (
    <form
      action={formAction}
      className="border-grid bg-accent-soft relative grid gap-x-10 gap-y-4 rounded-2xl border p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr]"
      noValidate
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Receba o resumo mensal</h2>
        <p className="text-ink-2 mt-1 text-sm leading-6 sm:text-base">
          Um e-mail por mês, quando os dados do ONS são atualizados: quanto foi cortado, onde e por
          quê. Sem propaganda.
        </p>
      </div>

      <div>
        <div className="flex flex-col gap-2 sm:flex-row">
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
            className="border-line bg-surface placeholder:text-muted min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-base"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-on-accent hover:bg-accent-strong rounded-lg px-5 py-2.5 font-semibold disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Inscrever"}
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm">
          <input
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
          />
          <label htmlFor={`${id}-consent`} className="text-ink-2 leading-5">
            Concordo em receber e-mails do Spillway e com o uso do meu e-mail apenas para esse fim,
            conforme a LGPD. Posso cancelar a qualquer momento pelo link em cada e-mail.{" "}
            <Link href="/privacidade" className="text-accent underline">
              Como tratamos seus dados
            </Link>
            .
          </label>
        </div>

        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Não preencha</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="source" value={signupSource} />

        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${
            state.status === "error"
              ? "text-danger"
              : state.status === "success"
                ? "text-success"
                : "sr-only"
          }`}
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
