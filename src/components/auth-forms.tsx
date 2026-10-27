"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Field, FormMessage, inputClass, primaryButton } from "@/components/form-fields";
import {
  deleteAccountAction,
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  type ActionResult,
} from "@/lib/auth-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/member-options";
import { VerifyCodeForm } from "@/components/verify-code-form";

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await loginAction({ email, password, next });
      if (response) setResult(response);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="email" label="E-mail" required>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field id="password" label="Senha" required>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={inputClass}
        />
      </Field>
      {result && !result.ok ? <FormMessage status="error">{result.message}</FormMessage> : null}
      {result && !result.ok && result.code === "unverified" ? (
        <div className="border-line space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium">Digite o código enviado ao seu e-mail</p>
          <VerifyCodeForm
            email={email}
            onVerified={() => void loginAction({ email, password, next })}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <Link href="/esqueci-a-senha" className="text-accent text-sm font-medium underline">
          Esqueci a senha
        </Link>
      </div>
    </form>
  );
}

const CODE_LENGTH = 6;

export function RecoverPasswordForm() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.ok && step === "code") {
    return (
      <div className="space-y-4">
        <FormMessage status="success">{result.message}</FormMessage>
        <Link href="/entrar" className={`${primaryButton} inline-block`}>
          Entrar
        </Link>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const response = await forgotPasswordAction(email);
            if (response.ok) {
              setDevCode(response.devCode ?? null);
              setResult(null);
              setStep("code");
            } else {
              setResult(response);
            }
          });
        }}
      >
        <Field id="email" label="E-mail do cadastro" required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={inputClass}
          />
        </Field>
        {result ? <FormMessage status="error">{result.message}</FormMessage> : null}
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Enviando…" : "Enviar código"}
        </button>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length !== CODE_LENGTH) {
          setResult({ ok: false, code: "invalid", message: "Digite os 6 dígitos do código." });
          return;
        }
        if (password !== confirm) {
          setResult({ ok: false, code: "invalid", message: "As senhas não conferem." });
          return;
        }
        startTransition(async () =>
          setResult(await resetPasswordAction({ email, code, password })),
        );
      }}
    >
      <p className="text-ink-2 text-sm">
        Se <strong>{email}</strong> tiver cadastro, enviamos um código de 6 dígitos. Ele vale por 30
        minutos.
      </p>
      {devCode ? (
        <FormMessage status="success">
          Ambiente de teste: o e-mail não é enviado. Seu código é <strong>{devCode}</strong>.
        </FormMessage>
      ) : null}
      <Field id="code" label="Código de 6 dígitos" required>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          className={`${inputClass} max-w-56 text-center text-2xl font-semibold tracking-[0.5em]`}
          placeholder="••••••"
        />
      </Field>
      <Field
        id="password"
        label="Nova senha"
        required
        hint={`No mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
      >
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field id="confirm" label="Repita a nova senha" required>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
          className={inputClass}
        />
      </Field>
      {result && !result.ok ? <FormMessage status="error">{result.message}</FormMessage> : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Salvando…" : "Salvar nova senha"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setResult(null);
            setCode("");
          }}
          className="text-accent text-sm font-medium underline"
        >
          Pedir outro código
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-danger text-sm font-medium underline"
      >
        Excluir minha conta e meus dados
      </button>
    );
  }
  return (
    <form
      className="border-danger space-y-3 rounded-xl border p-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await deleteAccountAction(password);
          if (response) setResult(response);
        });
      }}
    >
      <p className="text-sm">
        Isso apaga seu cadastro e o acesso, e não pode ser desfeito. Confirme com a sua senha.
      </p>
      <input
        type="password"
        autoComplete="current-password"
        aria-label="Sua senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={inputClass}
      />
      {result && !result.ok ? <FormMessage status="error">{result.message}</FormMessage> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || !password}
          className="bg-danger rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Excluir definitivamente
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-2 text-sm underline"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
