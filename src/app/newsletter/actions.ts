"use server";

import { headers } from "next/headers";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { NewsletterSignup, MessageResponse } from "@/lib/api/types";
import {
  validateNewsletterInput,
  visitorIpHeaders,
  type NewsletterFormState,
} from "@/lib/newsletter";

export async function subscribeNewsletter(
  _prev: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  if (formData.get("website")) {
    return { status: "success", message: "Pronto! Confira seu e-mail para confirmar a inscrição." };
  }

  const validation = validateNewsletterInput(formData.get("email"), formData.get("consent"));
  if (!validation.ok) return { status: "error", message: validation.message };

  const source = String(formData.get("source") ?? "portal").slice(0, 64);
  const body: NewsletterSignup = { email: validation.email, consent: true, source };

  const ipHeaders = visitorIpHeaders(await headers(), process.env.WEB_API_SECRET);

  try {
    await apiFetch<MessageResponse>("/v1/newsletter", {
      method: "POST",
      body,
      headers: ipHeaders,
    });
    return {
      status: "success",
      message:
        "Pronto! Enviamos um e-mail de confirmação. A inscrição só vale depois que você confirmar.",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { status: "error", message: "Muitas tentativas. Aguarde um minuto e tente de novo." };
    }
    if (error instanceof ApiError && error.status === 422) {
      return { status: "error", message: "Não foi possível validar o e-mail informado." };
    }
    return {
      status: "error",
      message: "Não conseguimos registrar sua inscrição agora. Tente novamente mais tarde.",
    };
  }
}
