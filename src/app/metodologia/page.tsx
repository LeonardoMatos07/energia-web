import Link from "next/link";
import { Container, Notice, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { REASONS } from "@/lib/reasons";

export const metadata = pageMetadata({
  title: "Metodologia",
  description:
    "De onde vêm os dados (ONS), como o corte é distribuído entre usinas, como estimamos a perda em R$ e quais são as limitações.",
  path: "/metodologia",
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6">
      {children}
    </h2>
  );
}

export default function MethodologyPage() {
  return (
    <Container>
      <PageHeader title="Metodologia">
        <p>
          Como transformamos os dados abertos do ONS nos números deste site — e onde eles têm
          limites.
        </p>
      </PageHeader>

      <div className="prose prose-site max-w-3xl">
        <H2 id="o-que-e">O que é curtailment</H2>
        <p>
          <em>Curtailment</em> (ou <em>constrained-off</em>) é quando o Operador Nacional do Sistema
          Elétrico (ONS) manda uma usina produzir menos do que ela poderia. A usina tem vento ou
          sol, está disponível, mas a energia não é aproveitada. Medimos esse corte em
          megawatts-hora (MWh) ou gigawatts-hora (GWh; 1 GWh = 1.000 MWh).
        </p>
        <p>
          O <strong>percentual de corte</strong> é a energia cortada dividida pela soma da energia
          gerada com a energia cortada: <code>cortada ÷ (verificada + cortada) × 100</code>.
        </p>

        <H2 id="fontes">De onde vêm os dados</H2>
        <p>
          Todos os números vêm do{" "}
          <a href="https://dados.ons.org.br/" rel="noopener noreferrer" target="_blank">
            portal de dados abertos do ONS
          </a>
          , nos conjuntos de <strong>restrição de operação por constrained-off</strong> de usinas
          eólicas e fotovoltaicas. Para cada usina ou conjunto e cada intervalo de tempo, o ONS
          publica a geração verificada, a geração de referência e a{" "}
          <strong>geração não realizada (GNRa)</strong> — a energia que deixou de ser produzida por
          causa da restrição — junto com o motivo da restrição.
        </p>
        <p>
          Os arquivos são baixados automaticamente, guardados sem alteração e processados todo mês.
          Os totais por estado, subsistema e Brasil são somas desses dados.
        </p>

        <H2 id="motivos">Motivos de restrição</H2>
        <p>O ONS classifica cada restrição em um motivo. Agrupamos assim:</p>
        <ul>
          {REASONS.map((m) => (
            <li key={m.key}>
              <strong>
                {m.name} ({m.abbreviation})
              </strong>
              : {m.explanation}
            </li>
          ))}
        </ul>

        <H2 id="rateio">Como o corte é distribuído entre as usinas</H2>
        <p>
          Muitas usinas são operadas pelo ONS em <strong>conjuntos</strong> — grupos de usinas
          ligadas ao mesmo ponto da rede. Nesses casos, o número oficial do ONS é o do conjunto, não
          o de cada usina. Para chegar à usina, fazemos um rateio em duas etapas:
        </p>
        <ol>
          <li>
            <strong>Por motivo:</strong> a GNRa oficial do conjunto em cada intervalo é dividida
            entre os motivos (REL, CNF, ENE, outros) na proporção dos minutos em que cada motivo
            esteve ativo.
          </li>
          <li>
            <strong>Por usina:</strong> a parte de cada motivo é distribuída entre as usinas do
            conjunto na proporção da perda estimada de cada uma — calculada a partir dos dados da
            própria usina (quanto ela poderia ter gerado menos o que gerou).
          </li>
        </ol>
        <p>
          O rateio é <strong>conservativo</strong>: a soma das usinas é sempre igual ao total
          oficial do conjunto, e os totais por estado e do Brasil batem com o ONS. Usinas
          despachadas individualmente pelo ONS não passam por rateio.
        </p>

        <H2 id="perda">Como estimamos a perda em R$</H2>
        <p>
          A perda estimada multiplica a energia cortada em cada meia hora pelo <strong>PLD</strong>{" "}
          (Preço de Liquidação das Diferenças) do submercado da usina naquele momento. Como a CCEE
          não oferece o PLD para download automatizado, reconstruímos o PLD horário pela mesma regra
          oficial: o <strong>CMO</strong> (Custo Marginal de Operação) publicado pelo ONS, limitado
          ao piso e ao teto horário que a ANEEL fixa para cada ano.
        </p>
        <p>
          O piso importa: o corte acontece quando sobra energia, e nessas horas o CMO costuma ficar
          perto de zero. Sem o piso, a perda pareceria nula. A página de cada usina mostra a base de
          preço usada no mês; quando faltavam valores de CMO em parte do mês e as lacunas precisaram
          ser preenchidas com o dia anterior, isso também é indicado.
        </p>
        <Notice>
          <strong>Ordem de grandeza, não prejuízo contábil.</strong> O PLD é o preço do mercado de
          curto prazo. A receita real de cada usina depende de contratos, do mercado em que ela
          vende a energia e de eventuais ressarcimentos regulatórios, que não estão nos dados
          públicos.
        </Notice>

        <H2 id="limitacoes">Limitações dos dados</H2>
        <ul>
          <li>
            <strong>Solar só a partir de abril de 2024.</strong> O ONS passou a publicar dados de
            restrição de usinas fotovoltaicas a partir desse mês. Antes disso, só há dados de
            eólicas — compare séries com cuidado.
          </li>
          <li>
            <strong>Meses recentes podem mudar.</strong> O ONS revisa os dados depois de
            publicá-los. Reprocessamos os meses recentes a cada carga, então os números podem mudar.
          </li>
          <li>
            <strong>Valores por usina em conjuntos são estimados.</strong> Veja o rateio acima.
          </li>
          <li>
            <strong>Cadastro.</strong> Nomes, potência e agentes vêm dos cadastros públicos e podem
            estar desatualizados.
          </li>
        </ul>

        <H2 id="atualizacao">Atualização</H2>
        <p>
          Os dados são processados quando o ONS publica novos arquivos. Ao fim de cada carga, as
          páginas do site são atualizadas automaticamente. Para receber um resumo mensal, assine a{" "}
          <Link href="/#newsletter">newsletter</Link>.
        </p>

        <H2 id="privacidade">Privacidade</H2>
        <p>
          Não há login público nem cookies de rastreamento. O único dado pessoal que guardamos é o
          e-mail de quem assina a newsletter. Veja os detalhes na{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </p>
      </div>
    </Container>
  );
}
