"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FormMessage, inputClass, primaryButton } from "@/components/form-fields";
import { resendVerificationAction, verifyEmailAction } from "@/lib/auth-actions";
import { trackEvent } from "@/lib/track";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyCodeForm({
  email,
  devCode,
  onVerified,
}: {
  email: string;
  devCode?: string | null;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(devCode ?? null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function submit(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await verifyEmailAction({ email, code: value });
      if (result.ok) {
        trackEvent("signup.code_verified");
        onVerified();
      } else {
        setError(result.message);
        setCode("");
        input.current?.focus();
      }
    });
  }

  function change(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) submit(digits);
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH) submit(code);
      }}
    >
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-medium">
          Código de 6 dígitos
        </label>
        <input
          ref={input}
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(event) => change(event.target.value)}
          aria-describedby="code-help"
          className={`${inputClass} max-w-56 text-center text-2xl font-semibold tracking-[0.5em]`}
          placeholder="••••••"
        />
        <p id="code-help" className="text-muted mt-1 text-xs">
          Enviamos para <strong>{email}</strong>. Vale por 30 minutos.
        </p>
      </div>
      {hint ? (
        <FormMessage status="success">
          Ambiente de teste: o e-mail não é enviado. Seu código é <strong>{hint}</strong>.
        </FormMessage>
      ) : null}
      {error ? <FormMessage status="error">{error}</FormMessage> : null}
      {notice ? <p className="text-ink-2 text-sm">{notice}</p> : null}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || code.length !== CODE_LENGTH}
          className={primaryButton}
        >
          {pending ? "Confirmando…" : "Confirmar"}
        </button>
        <button
          type="button"
          disabled={cooldown > 0 || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await resendVerificationAction(email);
              setNotice(result.message);
              setHint(result.ok ? (result.devCode ?? null) : null);
              setError(null);
              setCooldown(RESEND_COOLDOWN_SECONDS);
            })
          }
          className="text-accent text-sm font-medium underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
