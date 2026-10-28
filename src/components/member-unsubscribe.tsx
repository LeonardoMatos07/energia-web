"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setMemberNewsletter } from "@/app/newsletter/actions";

/** For a signed-in member who got here from the footer: cancel the monthly e-mail in one click. */
export function MemberUnsubscribe({ enabled: initial }: { enabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function turnOff() {
    setError(null);
    startTransition(async () => {
      const result = await setMemberNewsletter(false);
      if (result.ok) {
        setEnabled(result.enabled);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div
      role="status"
      className={`max-w-2xl rounded-lg border p-6 ${
        enabled
          ? "border-[var(--color-line)] bg-[var(--color-surface)]"
          : "border-success bg-success-soft"
      }`}
    >
      {enabled ? (
        <>
          <p className="text-base">Você recebe a newsletter mensal no seu e-mail cadastrado.</p>
          <button
            type="button"
            disabled={pending}
            onClick={turnOff}
            className="bg-accent text-on-accent mt-4 rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Cancelando…" : "Cancelar a newsletter mensal"}
          </button>
        </>
      ) : (
        <p className="text-base">
          Pronto, a newsletter mensal foi cancelada. Se mudar de ideia, é só ativar de novo na
          página inicial.
        </p>
      )}
      {error ? (
        <p role="alert" className="text-danger mt-3 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
