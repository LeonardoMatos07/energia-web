import type { Subsistema } from "./api/types";

export interface Estado {
  uf: string;
  nome: string;
  regiao: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}

export const ESTADOS: readonly Estado[] = [
  { uf: "AC", nome: "Acre", regiao: "Norte" },
  { uf: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { uf: "AM", nome: "Amazonas", regiao: "Norte" },
  { uf: "AP", nome: "Amapá", regiao: "Norte" },
  { uf: "BA", nome: "Bahia", regiao: "Nordeste" },
  { uf: "CE", nome: "Ceará", regiao: "Nordeste" },
  { uf: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { uf: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { uf: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { uf: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { uf: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { uf: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { uf: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { uf: "PA", nome: "Pará", regiao: "Norte" },
  { uf: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { uf: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { uf: "PI", nome: "Piauí", regiao: "Nordeste" },
  { uf: "PR", nome: "Paraná", regiao: "Sul" },
  { uf: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { uf: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { uf: "RO", nome: "Rondônia", regiao: "Norte" },
  { uf: "RR", nome: "Roraima", regiao: "Norte" },
  { uf: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { uf: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { uf: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { uf: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { uf: "TO", nome: "Tocantins", regiao: "Norte" },
];

export const REGIOES = ["Nordeste", "Norte", "Sudeste", "Sul", "Centro-Oeste"] as const;

export function findEstado(uf: string | undefined | null): Estado | undefined {
  if (!uf) return undefined;
  const upper = uf.toUpperCase();
  return ESTADOS.find((e) => e.uf === upper);
}

export const SUBSISTEMAS: readonly { id: Subsistema; nome: string }[] = [
  { id: "N", nome: "Norte" },
  { id: "NE", nome: "Nordeste" },
  { id: "SE", nome: "Sudeste/Centro-Oeste" },
  { id: "S", nome: "Sul" },
];

export function nomeSubsistema(id: string): string {
  if (id === "SIN") return "SIN (total nacional)";
  return SUBSISTEMAS.find((s) => s.id === id)?.nome ?? id;
}
