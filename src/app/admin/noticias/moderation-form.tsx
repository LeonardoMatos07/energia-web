"use client";

import { useActionState } from "react";
import type { AdminNewsItem } from "@/lib/api/types";
import type { AdminFormState } from "../actions";
import { updateNewsAction } from "./actions";

const initial: AdminFormState = { status: "idle", message: "" };
const input =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-base text-[var(--color-ink)]";

export function ModerationForm({ item }: { item: AdminNewsItem }) {
  const [state, formAction, pending] = useActionState(updateNewsAction, initial);
  const links = item.related_links.map((link) => `${link.label} | ${link.href}`).join("\n");

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={item.id} />
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
        <div>
          <label htmlFor={`status-${item.id}`} className="mb-1 block text-sm font-medium">
            Situação
          </label>
          <select
            id={`status-${item.id}`}
            name="status"
            defaultValue={item.status}
            className={input}
          >
            <option value="published">Publicado</option>
            <option value="hidden">Escondido</option>
            <option value="removed_on_request">Removido a pedido</option>
          </select>
        </div>
        <div>
          <label htmlFor={`note-${item.id}`} className="mb-1 block text-sm font-medium">
            Nota do Spillway (escrita por pessoa, sobre o fato e os nossos dados)
          </label>
          <textarea
            id={`note-${item.id}`}
            name="editor_note"
            rows={3}
            maxLength={2000}
            defaultValue={item.editor_note ?? ""}
            className={input}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`links-${item.id}`} className="mb-1 block text-sm font-medium">
          Páginas relacionadas (uma por linha: Rótulo | /caminho)
        </label>
        <textarea
          id={`links-${item.id}`}
          name="related_links"
          rows={2}
          defaultValue={links}
          className={input}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-on-accent hover:bg-accent-strong rounded-md px-4 py-2 font-semibold disabled:opacity-60"
        >
          Salvar
        </button>
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${state.status === "error" ? "text-danger" : "text-success"}`}
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
