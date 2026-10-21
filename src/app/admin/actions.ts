"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { signIn, signOut, isAuthConfigured } from "@/auth";
import { getAdminState } from "@/lib/admin-session";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { AdminReport, ReportInput, RevalidateResponse } from "@/lib/api/types";

export interface AdminFormState {
  status: "idle" | "success" | "error";
  message: string;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function loginAction() {
  if (!isAuthConfigured()) return;
  await signIn("cognito", { redirectTo: "/admin" });
}

export async function logoutAction() {
  if (!isAuthConfigured()) return;
  await signOut({ redirectTo: "/admin" });
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "A API recusou o acesso (sessão expirada ou sem permissão de admin). Entre novamente.";
    }
    return `Erro da API (${error.status || "sem conexão"}): ${error.detail}`;
  }
  return "Erro inesperado.";
}

export async function saveReportAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const state = await getAdminState();
  if (state.kind !== "admin") return { status: "error", message: "Sessão de admin necessária." };

  const month = String(formData.get("month") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const publish = formData.get("publish") === "on";

  if (!MONTH_RE.test(month))
    return { status: "error", message: "Mês deve estar no formato AAAA-MM." };
  if (!title) return { status: "error", message: "Informe o título." };
  if (slug && !SLUG_RE.test(slug)) {
    return { status: "error", message: "Slug: só letras minúsculas, números e hífens." };
  }
  if (!content.trim()) return { status: "error", message: "O conteúdo não pode ficar vazio." };

  const body: ReportInput = {
    month,
    title,
    content,
    publish,
    summary: summary || null,
    ...(slug ? { slug } : {}),
  };

  try {
    const saved = await apiFetch<AdminReport>("/v1/admin/reports", {
      method: "POST",
      body,
      accessToken: state.accessToken,
    });
    revalidateTag("reports");
    revalidatePath("/admin");
    return {
      status: "success",
      message: saved.published_at
        ? `Relatório “${saved.title}” publicado em /relatorios/${saved.slug}.`
        : `Rascunho “${saved.title}” salvo (slug ${saved.slug}).`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

export async function revalidateAction(
  _prev: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const state = await getAdminState();
  if (state.kind !== "admin") return { status: "error", message: "Sessão de admin necessária." };
  try {
    const res = await apiFetch<RevalidateResponse>("/v1/admin/revalidate", {
      method: "POST",
      body: {},
      accessToken: state.accessToken,
    });
    return {
      status: res.web_revalidated ? "success" : "error",
      message: res.web_revalidated
        ? `Cache da API limpo e portal revalidado (${res.tags.join(", ")}).`
        : `Cache da API limpo, mas o portal não foi revalidado: ${res.detail ?? "motivo desconhecido"}.`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
