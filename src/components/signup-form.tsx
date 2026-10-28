"use client";

import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import {
  CheckboxGroup,
  Field,
  FormMessage,
  inputClass,
  primaryButton,
  SelectField,
} from "@/components/form-fields";
import type { MemberRole, SignupPayload } from "@/lib/api/types";
import { loginAction, signUpAction } from "@/lib/auth-actions";
import { trackEvent } from "@/lib/track";
import { VerifyCodeForm } from "@/components/verify-code-form";
import {
  ACADEMIC_ROLES,
  COMPANY_SIZE_OPTIONS,
  CORPORATE_ROLES,
  INTEREST_OPTIONS,
  MAX_PLANTS,
  MIN_PASSWORD_LENGTH,
  REFERRAL_OPTIONS,
  REGION_OPTIONS,
  ROLE_OPTIONS,
  SEGMENT_OPTIONS,
  STUDY_LEVEL_OPTIONS,
} from "@/lib/member-options";

interface PlantHit {
  slug: string;
  name: string;
  kind: "plant" | "cluster";
  state: string;
  source: "wind" | "solar";
}

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
  role: MemberRole | "";
  organization: string;
  jobTitle: string;
  segment: string;
  companySize: string;
  institution: string;
  studyLevel: string;
  regions: string[];
  plants: PlantHit[];
  interests: string[];
  phone: string;
  referral: string;
  marketing: boolean;
  consent: boolean;
}

const INITIAL: FormValues = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  role: "",
  organization: "",
  jobTitle: "",
  segment: "",
  companySize: "",
  institution: "",
  studyLevel: "",
  regions: [],
  plants: [],
  interests: [],
  phone: "",
  referral: "",
  marketing: false,
  consent: false,
};

function PlantPicker({
  selected,
  onChange,
}: {
  selected: PlantHit[];
  onChange: (next: PlantHit[]) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlantHit[]>([]);
  const [loading, setLoading] = useState(false);
  const full = selected.length >= MAX_PLANTS;
  const ready = query.trim().length >= 2;

  useEffect(() => {
    if (!ready) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?${new URLSearchParams({ q: query.trim() })}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as { items?: PlantHit[] };
        setHits(body.items ?? []);
      } catch {
        if (!controller.signal.aborted) setHits([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, ready]);

  const chosen = new Set(selected.map((plant) => plant.slug));
  const add = (hit: PlantHit) => {
    if (full || chosen.has(hit.slug)) return;
    onChange([...selected, hit]);
    setQuery("");
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        Usinas que você acompanha (opcional, até {MAX_PLANTS})
      </label>
      {selected.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {selected.map((plant) => (
            <li
              key={plant.slug}
              className="border-line bg-surface inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 text-sm"
            >
              {plant.name} ({plant.state})
              <button
                type="button"
                aria-label={`Remover ${plant.name}`}
                onClick={() => onChange(selected.filter((p) => p.slug !== plant.slug))}
                className="text-muted hover:bg-surface-2 hover:text-ink inline-flex size-6 items-center justify-center rounded-full"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={id}
        type="search"
        autoComplete="off"
        disabled={full}
        value={query}
        placeholder={full ? "Limite atingido" : "Digite o nome da usina ou do conjunto"}
        onChange={(event) => setQuery(event.target.value)}
        className={inputClass}
      />
      {ready ? (
        <ul className="border-grid bg-surface mt-2 max-h-56 overflow-y-auto rounded-xl border">
          {loading ? (
            <li className="text-muted px-3 py-2 text-sm">Buscando…</li>
          ) : hits.length === 0 ? (
            <li className="text-muted px-3 py-2 text-sm">Nenhuma usina encontrada.</li>
          ) : (
            hits.map((hit) => (
              <li key={hit.slug}>
                <button
                  type="button"
                  disabled={chosen.has(hit.slug)}
                  onClick={() => add(hit)}
                  className="hover:bg-accent-soft flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm disabled:opacity-50"
                >
                  <span>{hit.name}</span>
                  <span className="text-muted text-xs">
                    {hit.kind === "cluster" ? "Conjunto" : "Usina"} ·{" "}
                    {hit.source === "wind" ? "Eólica" : "Solar"} · {hit.state}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-grid border-b pb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function SignupForm({ source = "cadastro" }: { source?: string }) {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [done, setDone] = useState<{ devCode: string | null } | null>(null);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const role = values.role;
  const corporate = role !== "" && CORPORATE_ROLES.includes(role);
  const academic = role !== "" && ACADEMIC_ROLES.includes(role);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!values.role) return setError("Escolha o seu perfil.");
    if (values.password !== values.confirm) return setError("As senhas não conferem.");
    if (corporate && !values.organization.trim()) return setError("Informe o nome da empresa.");
    if (academic && !values.institution.trim()) return setError("Informe a sua instituição.");
    if (!values.consent) return setError("Para criar a conta, aceite a Política de Privacidade.");

    const payload: SignupPayload = {
      email: values.email,
      password: values.password,
      name: values.name.trim(),
      role: values.role,
      organization: corporate ? values.organization.trim() : null,
      job_title: corporate ? values.jobTitle.trim() || null : null,
      segment: corporate ? values.segment || null : null,
      company_size: corporate ? values.companySize || null : null,
      institution: academic ? values.institution.trim() : null,
      study_level: academic ? values.studyLevel || null : null,
      regions: values.regions,
      plants: values.plants.map((plant) => plant.slug),
      interests: values.interests,
      phone: values.phone.trim() || null,
      referral: values.referral || null,
      marketing_opt_in: values.marketing,
      consent: true,
      source,
    };
    startTransition(async () => {
      const result = await signUpAction(payload);
      if (result.ok) setDone({ devCode: result.devCode ?? null });
      else if (result.code === "exists") {
        setError(null);
        setExists(true);
        trackEvent("signup.exists");
      } else {
        setExists(false);
        setError(result.message);
        trackEvent("signup.error", { message: result.message });
      }
    });
  }

  if (done) {
    return (
      <div className="border-grid bg-surface shadow-card space-y-4 rounded-2xl border p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Confirme seu e-mail</h2>
        <p className="text-ink-2 leading-7">
          Digite o código de 6 dígitos que enviamos para confirmar seu endereço e liberar o acesso.
        </p>
        <VerifyCodeForm
          email={values.email}
          devCode={done.devCode}
          onVerified={() =>
            void loginAction({ email: values.email, password: values.password, next: "/painel" })
          }
        />
        <p className="text-ink-2 text-sm">
          Errou o e-mail?{" "}
          <button type="button" onClick={() => setDone(null)} className="text-accent underline">
            Voltar e corrigir
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <Section title="1. Seu acesso">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nome completo" required>
            <input
              id="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              required
              minLength={2}
              maxLength={120}
              className={inputClass}
            />
          </Field>
          <Field id="email" label="E-mail" required hint="Use o e-mail do trabalho, se tiver.">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              required
              maxLength={254}
              className={inputClass}
            />
          </Field>
          <Field
            id="password"
            label="Senha"
            required
            hint={`No mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          >
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => set("password", event.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              className={inputClass}
            />
          </Field>
          <Field id="confirm" label="Repita a senha" required>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={values.confirm}
              onChange={(event) => set("confirm", event.target.value)}
              required
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="2. Sobre você">
        <SelectField
          id="role"
          label="Qual é o seu perfil?"
          value={values.role}
          onChange={(value) => {
            set("role", value as MemberRole | "");
            if (value) trackEvent("signup.role_selected", { role: value });
          }}
          options={ROLE_OPTIONS}
          required
        />
        {corporate ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="organization" label="Empresa" required>
              <input
                id="organization"
                autoComplete="organization"
                value={values.organization}
                onChange={(event) => set("organization", event.target.value)}
                maxLength={150}
                className={inputClass}
              />
            </Field>
            <Field id="jobTitle" label="Cargo ou área">
              <input
                id="jobTitle"
                autoComplete="organization-title"
                value={values.jobTitle}
                onChange={(event) => set("jobTitle", event.target.value)}
                maxLength={100}
                className={inputClass}
              />
            </Field>
            <SelectField
              id="segment"
              label="Segmento da empresa"
              value={values.segment}
              onChange={(value) => set("segment", value)}
              options={SEGMENT_OPTIONS}
            />
            <SelectField
              id="companySize"
              label="Tamanho da empresa"
              value={values.companySize}
              onChange={(value) => set("companySize", value)}
              options={COMPANY_SIZE_OPTIONS}
            />
          </div>
        ) : null}
        {academic ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="institution" label="Universidade ou instituição" required>
              <input
                id="institution"
                value={values.institution}
                onChange={(event) => set("institution", event.target.value)}
                maxLength={150}
                className={inputClass}
              />
            </Field>
            <SelectField
              id="studyLevel"
              label="Nível"
              value={values.studyLevel}
              onChange={(value) => set("studyLevel", value)}
              options={STUDY_LEVEL_OPTIONS}
            />
          </div>
        ) : null}
      </Section>

      <Section title="3. O que você quer acompanhar">
        <CheckboxGroup
          legend="Regiões de interesse"
          options={REGION_OPTIONS}
          selected={values.regions}
          onChange={(next) => set("regions", next)}
        />
        <PlantPicker selected={values.plants} onChange={(next) => set("plants", next)} />
        <CheckboxGroup
          legend="O que você pretende fazer aqui?"
          options={INTEREST_OPTIONS}
          selected={values.interests}
          onChange={(next) => set("interests", next)}
        />
      </Section>

      <Section title="4. Para chegarmos até você (opcional)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="phone"
            label="Telefone ou WhatsApp"
            hint="Só usamos se você autorizar o contato."
          >
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
              maxLength={20}
              className={inputClass}
            />
          </Field>
          <SelectField
            id="referral"
            label="Como conheceu o Spillway?"
            value={values.referral}
            onChange={(value) => set("referral", value)}
            options={REFERRAL_OPTIONS}
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.marketing}
            onChange={(event) => set("marketing", event.target.checked)}
            className="mt-1"
          />
          <span>
            Aceito receber contato do Spillway com novidades e propostas ligadas aos meus
            interesses.
          </span>
        </label>
      </Section>

      <div className="space-y-4">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(event) => set("consent", event.target.checked)}
            required
            className="mt-1"
          />
          <span>
            Li e concordo com a{" "}
            <Link href="/privacidade" className="text-accent underline" target="_blank">
              Política de Privacidade
            </Link>{" "}
            e autorizo o uso dos meus dados para criar a conta, liberar o acesso e registrar as
            páginas e consultas que eu fizer, para melhorar o produto.{" "}
            <span className="text-danger">*</span>
          </span>
        </label>
        {exists ? (
          <FormMessage status="error">
            Já existe uma conta com este e-mail.{" "}
            <Link href="/entrar" className="underline">
              Entrar
            </Link>{" "}
            ou{" "}
            <Link href="/esqueci-a-senha" className="underline">
              recuperar a senha
            </Link>
            .
          </FormMessage>
        ) : null}
        {error ? <FormMessage status="error">{error}</FormMessage> : null}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={primaryButton}>
            {pending ? "Criando…" : "Criar conta gratuita"}
          </button>
          <p className="text-ink-2 text-sm">
            Já tem conta?{" "}
            <Link href="/entrar" className="text-accent font-medium underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
