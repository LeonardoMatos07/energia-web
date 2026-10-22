"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { LoginResponse, MessageResponse, SignupPayload } from "@/lib/api/types";
import { getSessionToken, SESSION_COOKIE } from "@/lib/members";
import { safeNextPath } from "@/lib/safe-path";
import { MIN_PASSWORD_LENGTH } from "@/lib/member-options";
import { visitorIpHeaders } from "@/lib/newsletter";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; code: "invalid" | "unverified" | "rate" | "error"; message: string };

const GENERIC_ERROR = "Não conseguimos concluir agora. Tente novamente em alguns minutos.";
const RATE_ERROR = "Muitas tentativas. Aguarde um minuto e tente de novo.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ipHeaders() {
  return visitorIpHeaders(await headers(), process.env.WEB_API_SECRET);
}

function failure(error: unknown, fallback = GENERIC_ERROR): ActionResult {
  if (error instanceof ApiError && error.status === 429) {
    return { ok: false, code: "rate", message: RATE_ERROR };
  }
  return { ok: false, code: "error", message: fallback };
}

function validationMessage(detail: string): string {
  const lower = detail.toLowerCase();
  if (lower.includes("organization")) return "Informe o nome da empresa.";
  if (lower.includes("institution")) return "Informe a sua instituição de ensino ou pesquisa.";
  if (lower.includes("password")) {
    return `A senha precisa ter entre ${MIN_PASSWORD_LENGTH} e 128 caracteres.`;
  }
  if (lower.includes("email")) return "Informe um e-mail válido.";
  if (lower.includes("phone")) return "Telefone inválido. Use apenas números, espaços, + ou ( ).";
  if (lower.includes("consent")) return "Para criar a conta, aceite a Política de Privacidade.";
  return "Revise os campos do formulário.";
}

export async function signUpAction(payload: SignupPayload): Promise<ActionResult> {
  if (!EMAIL_RE.test(payload.email)) {
    return { ok: false, code: "invalid", message: "Informe um e-mail válido." };
  }
  if (payload.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      code: "invalid",
      message: `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  try {
    await apiFetch<MessageResponse>("/v1/auth/signup", {
      method: "POST",
      body: { ...payload, email: payload.email.trim().toLowerCase(), consent: true },
      headers: await ipHeaders(),
    });
    return {
      ok: true,
      message: "Enviamos um e-mail para confirmar seu endereço. O acesso é liberado depois disso.",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      return { ok: false, code: "invalid", message: validationMessage(error.detail) };
    }
    return failure(error);
  }
}

export async function loginAction(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult> {
  let session: LoginResponse;
  try {
    session = await apiFetch<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: { email: input.email.trim().toLowerCase(), password: input.password },
      headers: await ipHeaders(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, code: "invalid", message: "E-mail ou senha incorretos." };
    }
    if (error instanceof ApiError && error.status === 403) {
      return {
        ok: false,
        code: "unverified",
        message: "Seu e-mail ainda não foi confirmado. Procure o e-mail que enviamos no cadastro.",
      };
    }
    return failure(error);
  }
  (await cookies()).set(SESSION_COOKIE, session.session_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expires_at),
  });
  redirect(safeNextPath(input.next));
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  try {
    await apiFetch<MessageResponse>("/v1/auth/resend-verification", {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
      headers: await ipHeaders(),
    });
    return { ok: true, message: "Se o e-mail estiver cadastrado, enviamos um novo link." };
  } catch (error) {
    return failure(error);
  }
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await apiFetch<MessageResponse>("/v1/auth/logout", { method: "POST", accessToken: token });
    } catch {}
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  if (!EMAIL_RE.test(email)) {
    return { ok: false, code: "invalid", message: "Informe um e-mail válido." };
  }
  try {
    await apiFetch<MessageResponse>("/v1/auth/forgot-password", {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
      headers: await ipHeaders(),
    });
    return {
      ok: true,
      message: "Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function resetPasswordAction(input: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      code: "invalid",
      message: `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  try {
    await apiFetch<MessageResponse>("/v1/auth/reset-password", {
      method: "POST",
      body: input,
      headers: await ipHeaders(),
    });
    return { ok: true, message: "Senha atualizada. Agora é só entrar." };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return {
        ok: false,
        code: "invalid",
        message: "Este link venceu ou já foi usado. Peça um novo em “Esqueci a senha”.",
      };
    }
    return failure(error);
  }
}

export async function deleteAccountAction(password: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return { ok: false, code: "error", message: "Entre novamente para continuar." };
  try {
    await apiFetch<MessageResponse>("/v1/auth/me/delete", {
      method: "POST",
      body: { password },
      accessToken: token,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, code: "invalid", message: "Senha incorreta." };
    }
    return failure(error);
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
