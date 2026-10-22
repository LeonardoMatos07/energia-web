import type { MemberRole } from "@/lib/api/types";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const ROLE_OPTIONS: Option<MemberRole>[] = [
  { value: "professional", label: "Profissional de empresa" },
  { value: "investor", label: "Investidor(a) ou financiador(a)" },
  { value: "researcher", label: "Pesquisador(a)" },
  { value: "student", label: "Estudante" },
  { value: "journalist", label: "Jornalista" },
  { value: "public_sector", label: "Setor público ou regulador" },
  { value: "other", label: "Outro" },
];

export const SEGMENT_OPTIONS: Option[] = [
  { value: "generator", label: "Geradora (eólica, solar ou outra)" },
  { value: "storage_developer", label: "Armazenamento / baterias" },
  { value: "trader", label: "Comercializadora de energia" },
  { value: "consultancy", label: "Consultoria ou engenharia" },
  { value: "financial", label: "Banco, fundo ou seguradora" },
  { value: "consumer", label: "Consumidor de energia (indústria, comércio, data center)" },
  { value: "utility", label: "Distribuidora ou transmissora" },
  { value: "equipment", label: "Fornecedor de equipamentos" },
  { value: "law_regulatory", label: "Jurídico ou regulatório" },
  { value: "other", label: "Outro" },
];

export const COMPANY_SIZE_OPTIONS: Option[] = [
  { value: "1-10", label: "1 a 10 pessoas" },
  { value: "11-50", label: "11 a 50" },
  { value: "51-200", label: "51 a 200" },
  { value: "201-1000", label: "201 a 1.000" },
  { value: "1000+", label: "Mais de 1.000" },
];

export const STUDY_LEVEL_OPTIONS: Option[] = [
  { value: "undergraduate", label: "Graduação" },
  { value: "master", label: "Mestrado" },
  { value: "phd", label: "Doutorado" },
  { value: "postdoc", label: "Pós-doutorado" },
  { value: "other", label: "Outro" },
];

export const REGION_OPTIONS: Option[] = ["Nordeste", "Norte", "Sudeste", "Sul", "Centro-Oeste"].map(
  (value) => ({ value, label: value }),
);

export const INTEREST_OPTIONS: Option[] = [
  { value: "monitor_losses", label: "Monitorar as perdas de usinas" },
  { value: "compensation", label: "Entender o ressarcimento dos cortes" },
  { value: "storage", label: "Armazenamento e baterias" },
  { value: "free_market", label: "Mercado livre de energia" },
  { value: "investment", label: "Avaliar investimentos" },
  { value: "data_api", label: "Obter dados para análises ou sistemas" },
  { value: "research", label: "Pesquisa acadêmica" },
  { value: "press", label: "Reportagem" },
];

export const REFERRAL_OPTIONS: Option[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "search", label: "Busca no Google" },
  { value: "friend", label: "Indicação" },
  { value: "event", label: "Evento ou associação" },
  { value: "press", label: "Notícia ou artigo" },
  { value: "other", label: "Outro" },
];

export const CORPORATE_ROLES: readonly MemberRole[] = ["professional", "investor"];
export const ACADEMIC_ROLES: readonly MemberRole[] = ["student", "researcher"];
export const MAX_PLANTS = 5;
export const MIN_PASSWORD_LENGTH = 10;
