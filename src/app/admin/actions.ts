"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { signIn, signOut, isAuthConfigured } from "@/auth";
import { getAdminState } from "@/lib/admin-session";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { RelatorioAdmin, RelatorioEntrada, RevalidarResposta } from "@/lib/api/types";

export interface AdminFormState {
  status: "idle" | "success" | "error";
  message: string;
}

const MES_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
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

export async function saveRelatorioAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const state = await getAdminState();
  if (state.kind !== "admin") return { status: "error", message: "Sessão de admin necessária." };

  const mes = String(formData.get("mes") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "");
  const publicar = formData.get("publicar") === "on";

  if (!MES_RE.test(mes)) return { status: "error", message: "Mês deve estar no formato AAAA-MM." };
  if (!titulo) return { status: "error", message: "Informe o título." };
  if (slug && !SLUG_RE.test(slug)) {
    return { status: "error", message: "Slug: só letras minúsculas, números e hífens." };
  }
  if (!conteudo.trim()) return { status: "error", message: "O conteúdo não pode ficar vazio." };

  const body: RelatorioEntrada = {
    mes,
    titulo,
    conteudo,
    publicar,
    resumo: resumo || null,
    ...(slug ? { slug } : {}),
  };

  try {
    const saved = await apiFetch<RelatorioAdmin>("/v1/admin/relatorios", {
      method: "POST",
      body,
      accessToken: state.accessToken,
    });
    revalidateTag("relatorios");
    revalidatePath("/admin");
    return {
      status: "success",
      message: saved.publicado_em
        ? `Relatório “${saved.titulo}” publicado em /relatorios/${saved.slug}.`
        : `Rascunho “${saved.titulo}” salvo (slug ${saved.slug}).`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

export async function revalidarAction(
  _prev: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  const state = await getAdminState();
  if (state.kind !== "admin") return { status: "error", message: "Sessão de admin necessária." };
  try {
    const res = await apiFetch<RevalidarResposta>("/v1/admin/revalidar", {
      method: "POST",
      body: {},
      accessToken: state.accessToken,
    });
    return {
      status: res.web_revalidado ? "success" : "error",
      message: res.web_revalidado
        ? `Cache da API limpo e portal revalidado (${res.tags.join(", ")}).`
        : `Cache da API limpo, mas o portal não foi revalidado: ${res.detalhe ?? "motivo desconhecido"}.`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
