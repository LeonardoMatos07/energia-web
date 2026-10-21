import type { Subsystem } from "./api/types";

export interface BrazilianState {
  state: string;
  name: string;
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}

export const STATES: readonly BrazilianState[] = [
  { state: "AC", name: "Acre", region: "Norte" },
  { state: "AL", name: "Alagoas", region: "Nordeste" },
  { state: "AM", name: "Amazonas", region: "Norte" },
  { state: "AP", name: "Amapá", region: "Norte" },
  { state: "BA", name: "Bahia", region: "Nordeste" },
  { state: "CE", name: "Ceará", region: "Nordeste" },
  { state: "DF", name: "Distrito Federal", region: "Centro-Oeste" },
  { state: "ES", name: "Espírito Santo", region: "Sudeste" },
  { state: "GO", name: "Goiás", region: "Centro-Oeste" },
  { state: "MA", name: "Maranhão", region: "Nordeste" },
  { state: "MG", name: "Minas Gerais", region: "Sudeste" },
  { state: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste" },
  { state: "MT", name: "Mato Grosso", region: "Centro-Oeste" },
  { state: "PA", name: "Pará", region: "Norte" },
  { state: "PB", name: "Paraíba", region: "Nordeste" },
  { state: "PE", name: "Pernambuco", region: "Nordeste" },
  { state: "PI", name: "Piauí", region: "Nordeste" },
  { state: "PR", name: "Paraná", region: "Sul" },
  { state: "RJ", name: "Rio de Janeiro", region: "Sudeste" },
  { state: "RN", name: "Rio Grande do Norte", region: "Nordeste" },
  { state: "RO", name: "Rondônia", region: "Norte" },
  { state: "RR", name: "Roraima", region: "Norte" },
  { state: "RS", name: "Rio Grande do Sul", region: "Sul" },
  { state: "SC", name: "Santa Catarina", region: "Sul" },
  { state: "SE", name: "Sergipe", region: "Nordeste" },
  { state: "SP", name: "São Paulo", region: "Sudeste" },
  { state: "TO", name: "Tocantins", region: "Norte" },
];

export const DEFAULT_SCOPE = "SIN";

export const REGIONS = ["Nordeste", "Norte", "Sudeste", "Sul", "Centro-Oeste"] as const;

export function findState(state: string | undefined | null): BrazilianState | undefined {
  if (!state) return undefined;
  const upper = state.toUpperCase();
  return STATES.find((e) => e.state === upper);
}

export const SUBSYSTEMS: readonly { id: Subsystem; name: string }[] = [
  { id: "N", name: "Norte" },
  { id: "NE", name: "Nordeste" },
  { id: "SE", name: "Sudeste/Centro-Oeste" },
  { id: "S", name: "Sul" },
];

export function subsystemName(id: string): string {
  if (id === "SIN") return "SIN (total nacional)";
  return SUBSYSTEMS.find((s) => s.id === id)?.name ?? id;
}
