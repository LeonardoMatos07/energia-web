/** Restriction reasons used by the ONS in the constrained-off data, in plain Portuguese. */
export const MOTIVOS = [
  {
    key: "rel",
    campo: "corte_rel_mwh",
    sigla: "REL",
    nome: "Confiabilidade elétrica",
    explicacao:
      "O ONS reduziu a geração para manter a rede segura: limites de transmissão, estabilidade ou tensão em uma região, mesmo com todos os equipamentos funcionando.",
  },
  {
    key: "cnf",
    campo: "corte_cnf_mwh",
    sigla: "CNF",
    nome: "Indisponibilidade externa",
    explicacao:
      "A energia não tinha como ser escoada porque uma linha, transformador ou subestação fora da usina estava desligado (manutenção ou falha).",
  },
  {
    key: "ene",
    campo: "corte_ene_mwh",
    sigla: "ENE",
    nome: "Razão energética",
    explicacao:
      "Havia mais oferta de energia do que consumo no sistema naquele momento; o ONS cortou geração para equilibrar carga e geração.",
  },
  {
    key: "outros",
    campo: "corte_outros_mwh",
    sigla: "Outros",
    nome: "Outros motivos",
    explicacao:
      "Restrições sem classificação nas três categorias acima ou com motivo não informado pelo ONS.",
  },
] as const;

export type MotivoKey = (typeof MOTIVOS)[number]["key"];
export type MotivoCampo = (typeof MOTIVOS)[number]["campo"];
