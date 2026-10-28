import { Card, Notice, Section } from "@/components/ui";
import type { ForecastModelMeta } from "@/lib/api/types";
import {
  calibrationPoints,
  formatDay,
  gainSentence,
  intervalVs,
  resultRows,
  SOURCE_LABEL,
  topFeatures,
} from "@/lib/forecast";
import { formatDate, formatNumber } from "@/lib/format";
import { RELIABILITY_COLORS, ReliabilityChart } from "./reliability-chart";

const STALE_MODEL_DAYS = 45;

function daysSince(iso: string, now: number): number {
  return Math.floor((now - new Date(iso).getTime()) / 86_400_000);
}

function formatBrier(value: number) {
  return formatNumber(value, 3, 3);
}

export function ForecastResults({
  meta,
  now = Date.now(),
}: {
  meta: ForecastModelMeta;
  now?: number;
}) {
  const rows = resultRows(meta);
  const sources = Object.entries(meta.data_period);
  const baseRate = meta.metrics.test_base_rate;
  const bins = meta.calibration.bins ?? {};
  const reliability = [
    {
      key: "hist_gbm",
      label: "Modelo",
      description: "Nosso modelo. Quanto mais perto da linha tracejada fina, melhor.",
      color: RELIABILITY_COLORS.model,
      points: calibrationPoints(bins.hist_gbm),
    },
    {
      key: "climatology",
      label: "Média histórica",
      description: "Regra simples de comparação: o que costuma acontecer naquele mês, dia e hora.",
      color: RELIABILITY_COLORS.baseline,
      dashed: true,
      points: calibrationPoints(bins.climatology),
    },
  ].filter((item) => item.points.length > 0);
  const features = topFeatures(meta.feature_importance);
  const gain = gainSentence(meta);
  const trainedDays = daysSince(meta.trained_at, now);
  const mae = intervalVs(meta, "climatology", "abs_error");
  const modelBeatsBaseline = mae !== null && mae.ci_high < 0;

  return (
    <div className="space-y-2">
      <Section id="o-que-e" title="O que é este modelo">
        <div className="text-ink-2 max-w-3xl space-y-3 text-base leading-7">
          <p>
            Todo dia, o ONS manda usinas eólicas e solares reduzirem a geração (o “corte” ou
            <em> curtailment</em>). O modelo olha o que aconteceu nas últimas semanas em cada região
            (quanto foi cortado em cada hora, quanto se gerou, dia da semana, mês e feriados) e
            estima, para cada hora dos próximos 7 dias, a{" "}
            <strong>chance de o corte passar de 10%</strong> da geração possível e o{" "}
            <strong>corte esperado</strong>.
          </p>
          <p>
            Ele é um <strong>indicador de risco</strong>, não uma promessa: serve para saber em que
            horas o corte costuma ser mais provável, não para saber o valor exato.
          </p>
        </div>
      </Section>

      <Section id="dados" title="Dados usados">
        <Card className="p-5 sm:p-6">
          <ul className="grid gap-4 sm:grid-cols-2">
            {sources.map(([source, period]) => (
              <li key={source}>
                <p className="font-semibold">
                  {SOURCE_LABEL[source as keyof typeof SOURCE_LABEL] ?? source}
                </p>
                <p className="text-ink-2 text-sm">
                  De {formatDay(period.start, "full")} a {formatDay(period.end, "full")},{" "}
                  {period.n_series} séries (estados, subsistemas e Brasil).
                </p>
              </li>
            ))}
          </ul>
          <p className="text-muted mt-4 text-xs leading-5">
            Dados públicos do ONS, já tratados no pipeline do Spillway (sem duplicatas, linhas
            inválidas separadas). {formatNumber(meta.n_rows, 0)} previsões de treino, em{" "}
            {meta.n_series} séries. Treinado em {formatDate(meta.trained_at)} (versão{" "}
            {meta.model_version}).
          </p>
        </Card>
      </Section>

      <Section id="validacao" title="Como foi testado">
        <div className="text-ink-2 max-w-3xl space-y-3 text-base leading-7">
          <p>
            O teste respeita o tempo: o modelo só “vê” dados anteriores à data prevista, nunca
            embaralhamos passado e futuro. Primeiro ele foi avaliado em cinco janelas de três meses,
            cada uma prevista só com o que veio antes (com uma folga de 7 dias). Depois, um período
            final
            {meta.metrics.test_start
              ? ` (a partir de ${formatDay(meta.metrics.test_start, "full")})`
              : ""}{" "}
            ficou guardado e foi usado uma única vez, sem ajustes.
            {meta.metrics.test_rows
              ? ` Foram ${formatNumber(meta.metrics.test_rows, 0)} previsões horárias nesse teste.`
              : ""}
          </p>
          <p>
            Para saber se vale a pena, comparamos com duas regras simples: repetir a{" "}
            <strong>mesma hora da semana passada</strong> e usar a <strong>média histórica</strong>{" "}
            daquele mês, dia e hora.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="border-grid bg-surface shadow-card w-full min-w-[620px] overflow-hidden rounded-2xl border text-sm">
            <caption className="sr-only">
              Resultados no período de teste: modelo contra as duas regras simples
            </caption>
            <thead className="bg-surface-2 text-ink-2 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Método
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Erro médio (pontos %)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Acerto ao separar horas de risco (0,5 a 1)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Erro de probabilidade (Brier)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Calibração (ECE)
                </th>
              </tr>
            </thead>
            <tbody className="tabular">
              {rows.map((row) => (
                <tr key={row.key} className={row.isModel ? "bg-accent-soft/50 font-semibold" : ""}>
                  <th scope="row" className="px-4 py-3 text-left font-medium">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-right">{formatNumber(row.metrics.mae_pp, 1, 1)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatNumber(row.metrics.roc_auc, 3, 3)}
                  </td>
                  <td className="px-4 py-3 text-right">{formatBrier(row.metrics.brier)}</td>
                  <td className="px-4 py-3 text-right">{formatBrier(row.metrics.ece)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted mt-3 max-w-3xl text-xs leading-5">
          Para os quatro números, menor é melhor, exceto o acerto (quanto mais perto de 1, melhor).
          O erro médio é a diferença média entre o corte previsto e o real, em pontos percentuais da
          geração possível. A calibração mede se “70% de risco” realmente acontece em cerca de 70%
          das vezes (quanto menor, mais confiável).
          {baseRate !== undefined
            ? ` No período de teste, ${formatNumber(baseRate * 100, 0)}% das horas tiveram corte de 10% ou mais.`
            : ""}
        </p>
        {gain ? (
          <p className="mt-3 max-w-3xl text-sm leading-6">
            <strong>Resumo honesto:</strong> {gain}{" "}
            {modelBeatsBaseline
              ? "O ganho é real no período testado, mas não há garantia de que se mantenha em outros períodos."
              : ""}
          </p>
        ) : null}
      </Section>

      {reliability.length > 0 ? (
        <Section id="confiabilidade" title="O risco previsto é confiável?">
          <p className="text-ink-2 mb-4 max-w-3xl text-base leading-7">
            Agrupamos as horas do teste pelo risco que o modelo previu e vimos quantas realmente
            tiveram corte. Quanto mais perto da linha tracejada, mais confiável é o número: se o
            modelo diz 70%, deveria acontecer em cerca de 70% das horas.
          </p>
          <ReliabilityChart series={reliability} />
        </Section>
      ) : null}

      {features.length > 0 ? (
        <Section id="pesos" title="O que mais pesa na previsão">
          <Card className="p-5 sm:p-6">
            <ol className="space-y-3">
              {features.map((feature) => (
                <li key={feature.key}>
                  <div className="text-sm">{feature.label}</div>
                  <div
                    className="bg-surface-2 mt-1 h-2 rounded-full"
                    role="img"
                    aria-label={`Peso relativo: ${formatNumber(feature.share * 100, 0)}%`}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.max(2, feature.share * 100)}%`,
                        background: "var(--color-series-3)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-muted mt-4 text-xs">
              Importância medida pelo quanto o erro piora quando a informação é embaralhada.
            </p>
          </Card>
        </Section>
      ) : null}

      <Section id="conclusao" title="Conclusão e cuidados">
        <div className="text-ink-2 max-w-3xl space-y-3 text-base leading-7">
          <p>
            <strong>Em resumo:</strong>{" "}
            {modelBeatsBaseline
              ? "no período de teste o modelo errou menos e separou melhor as horas de risco do que as regras simples, e suas probabilidades são razoavelmente confiáveis, em especial nos extremos (risco muito baixo ou muito alto). Use-o como um guia de quando o corte tende a ser mais provável."
              : "no período de teste o modelo não se mostrou claramente melhor do que as regras simples; trate a previsão com cautela."}
          </p>
          <p className="text-ink font-semibold">Cuidados ao usar:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Leia como probabilidade, não como certeza.</strong> 70% de risco quer dizer
              que, em cerca de 7 de cada 10 horas assim, houve corte.
            </li>
            <li>
              <strong>Não decida sozinho com este número.</strong> Para contratos, operação ou
              investimento, confira com dados oficiais do ONS e com sua equipe técnica.
            </li>
            <li>
              <strong>Desconfie dos dias fora do padrão:</strong> falhas, manutenções e decisões do
              operador não entram, e o tempo (vento, sol) também não.
            </li>
            <li>
              <strong>Veja a data dos dados.</strong> Quando o último dado do ONS é antigo, a
              previsão fica menos confiável; o aviso no topo da página mostra isso.
            </li>
            <li>
              <strong>O desempenho passado não garante o futuro.</strong> O resultado vale para o
              período testado e pode mudar em outras épocas.
            </li>
          </ul>
        </div>
      </Section>

      <Section id="limites" title="O que o modelo não faz">
        <ul className="text-ink-2 max-w-3xl list-disc space-y-2 pl-5 text-base leading-7">
          <li>
            <strong>Não usa previsão do tempo.</strong> Vento, sol e temperatura futuros não entram;
            o modelo só olha o histórico. Isso é a maior limitação conhecida.
          </li>
          <li>
            É um indicador de risco, não uma garantia. Dias fora do padrão (obras, falhas em linhas
            de transmissão, decisões do operador) não são previstos.
          </li>
          <li>
            A solar tem só cerca de 2,5 anos de histórico (a eólica, cerca de 5). Horas sem sol não
            entram na solar.
          </li>
          <li>
            A precisão cai conforme o horizonte aumenta e quando os dados de entrada são antigos: os
            dados do ONS são publicados uma vez por mês.
          </li>
        </ul>
        <div className="mt-5">
          <Notice>
            Modelo treinado em {formatDate(meta.trained_at)} ({trainedDays} dias atrás)
            {meta.last_data_through
              ? `, com dados até ${formatDay(meta.last_data_through, "full")}`
              : ""}
            .{" "}
            {trainedDays > STALE_MODEL_DAYS
              ? "O treino já está desatualizado e deve ser refeito."
              : "O treino é refeito manualmente, em geral uma vez por mês."}
          </Notice>
        </div>
      </Section>
    </div>
  );
}
