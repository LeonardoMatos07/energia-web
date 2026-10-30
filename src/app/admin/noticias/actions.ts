"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminState } from "@/lib/admin-session";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { AdminNewsItem, NewsStatus } from "@/lib/api/types";
import { parseRelatedLinks } from "@/lib/news";
import type { AdminFormState } from "../actions";

const STATUSES: NewsStatus[] = ["published", "hidden", "removed_on_request"];

export async function updateNewsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const state = await getAdminState();
  if (state.kind !== "admin") return { status: "error", message: "Sessão de admin necessária." };

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "") as NewsStatus;
  const note = String(formData.get("editor_note") ?? "").trim();
  const links = parseRelatedLinks(String(formData.get("related_links") ?? ""));

  if (!Number.isInteger(id) || id <= 0) return { status: "error", message: "Item inválido." };
  if (!STATUSES.includes(status)) return { status: "error", message: "Status inválido." };
  if (links === null) {
    return {
      status: "error",
      message: 'Links: uma linha por link, no formato "Rótulo | /caminho" ou "Rótulo | https://…".',
    };
  }

  try {
    await apiFetch<AdminNewsItem>(`/v1/admin/news/${id}`, {
      method: "PATCH",
      body: {
        status,
        ...(note ? { editor_note: note } : { clear_editor_note: true }),
        related_links: links,
      },
      accessToken: state.accessToken,
    });
    revalidateTag("news");
    revalidatePath("/admin/noticias");
    return { status: "success", message: "Salvo." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: `Erro da API (${error.status}): ${error.detail}` };
    }
    return { status: "error", message: "Erro inesperado." };
  }
}
