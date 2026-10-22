"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, inputClass, primaryButton } from "@/components/form-fields";
import { VerifyCodeForm } from "@/components/verify-code-form";

export function VerifyStandalone({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [asking, setAsking] = useState(initialEmail.length === 0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="space-y-4">
        <p className="border-success bg-success-soft rounded-lg border p-4">
          E-mail confirmado! Seu acesso gratuito está liberado.
        </p>
        <Link href="/entrar" className={`${primaryButton} inline-block`}>
          Entrar
        </Link>
      </div>
    );
  }
  if (asking) {
    return (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setAsking(false);
        }}
      >
        <Field id="email" label="E-mail do cadastro" required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </Field>
        <button type="submit" className={primaryButton}>
          Continuar
        </button>
      </form>
    );
  }
  return <VerifyCodeForm email={email} onVerified={() => setDone(true)} />;
}
