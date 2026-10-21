"use client";

import { useActionState } from "react";
import type { AdminFormState } from "./actions";

type Action = (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
const initial: AdminFormState = { status: "idle", message: "" };

const input =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-base text-[var(--color-ink)]";

function Status({ state }: { state: AdminFormState }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm ${
        state.status === "error"
          ? "text-danger"
          : state.status === "success"
            ? "text-success"
            : "sr-only"
      }`}
    >
      {state.message}
    </p>
  );
}

export function RelatorioForm({ action, defaultMes }: { action: Action; defaultMes: string }) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <label htmlFor="mes" className="mb-1 block text-sm font-medium">
            Mês de referência
          </label>
          <input
            id="mes"
            name="mes"
            type="month"
            required
            defaultValue={defaultMes}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
            Título
          </label>
          <input id="titulo" name="titulo" required maxLength={300} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium">
          Slug (opcional — use o mesmo para atualizar um relatório existente)
        </label>
        <input
          id="slug"
          name="slug"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={200}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="resumo" className="mb-1 block text-sm font-medium">
          Resumo (opcional)
        </label>
        <textarea id="resumo" name="resumo" rows={2} className={input} />
      </div>
      <div>
        <label htmlFor="conteudo" className="mb-1 block text-sm font-medium">
          Conteúdo (Markdown)
        </label>
        <textarea
          id="conteudo"
          name="conteudo"
          rows={14}
          required
          className={`${input} font-mono text-sm`}
        />
      </div>
      <div className="flex items-center gap-2">
        <input id="publicar" name="publicar" type="checkbox" className="h-4 w-4" />
        <label htmlFor="publicar" className="text-sm">
          Publicar agora (desmarcado = salvar como rascunho)
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-on-accent rounded-md px-4 py-2 font-semibold disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar relatório"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function RevalidarForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="border-line bg-surface rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Revalidando…" : "Limpar cache e revalidar o portal"}
      </button>
      <Status state={state} />
    </form>
  );
}
