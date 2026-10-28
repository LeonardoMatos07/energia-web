import Link from "next/link";
import { Container, Notice, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { getContactEmail, SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Política de privacidade",
  description: `Quais dados pessoais o ${SITE_NAME} trata, para quê, por quanto tempo e como exercer seus direitos pela LGPD.`,
  path: "/privacidade",
});

const UPDATED_AT = "27 de outubro de 2026";

export default function PrivacyPage() {
  const contact = getContactEmail();

  return (
    <Container>
      <PageHeader title="Política de privacidade">
        <p>Última atualização: {UPDATED_AT}.</p>
      </PageHeader>

      <div className="prose prose-site max-w-3xl">
        <p>
          No {SITE_NAME}, o painel, as páginas de estados e de usinas e os relatórios mensais são
          abertos: você os vê sem conta. Comparar usinas, ver a série horária e exportar dados
          exigem uma conta gratuita. Tratamos dados pessoais em três situações: quando você assina a
          newsletter, quando cria uma conta e quando usa o site (registro de uso). Esta página
          explica cada uma conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).
        </p>

        <h2 id="controlador">Quem é o controlador</h2>
        {contact ? (
          <p>
            O controlador dos dados é o responsável pelo {SITE_NAME}. Para qualquer pedido sobre
            seus dados, escreva para <a href={`mailto:${contact}`}>{contact}</a>.
          </p>
        ) : (
          <Notice>
            O e-mail de contato para assuntos de privacidade ainda não foi configurado
            (NEXT_PUBLIC_CONTACT_EMAIL).
          </Notice>
        )}

        <h2 id="dados">Quais dados tratamos e para quê</h2>
        <ul>
          <li>
            <strong>Newsletter:</strong> seu e-mail, a data em que você deu o consentimento, a data
            da confirmação e, se for o caso, a data do descadastro. A finalidade é só enviar o
            resumo mensal de curtailment. A base legal é o seu consentimento (art. 7º, I), dado ao
            marcar a caixa do formulário e confirmado pelo link enviado por e-mail.
          </li>
          <li>
            <strong>Conta gratuita:</strong> nome, e-mail, senha (guardada apenas em forma de hash,
            nunca em texto), perfil (por exemplo, pesquisador, estudante ou profissional de
            empresa), empresa ou instituição e cargo, segmento e porte da empresa, regiões e usinas
            de interesse, o que você pretende fazer no site, telefone e como nos conheceu (estes
            dois últimos opcionais), a data do consentimento e do último acesso. Usamos para criar e
            proteger a sua conta, liberar o acesso às funcionalidades e entender quem usa o site e o
            que mais interessa. A base legal é o seu consentimento (art. 7º, I) e a execução do
            serviço que você pediu (art. 7º, V). Se você marcar a caixa de contato, também podemos
            falar com você sobre novidades e propostas ligadas aos seus interesses; esse
            consentimento é separado e pode ser retirado a qualquer momento.
          </li>
          <li>
            <strong>Uso do site, com conta:</strong> registramos as páginas que você abre, os
            filtros e períodos que escolhe, as consultas que faz (por exemplo, um estado, uma usina
            ou uma comparação), as buscas, os cliques em botões e o tempo de permanência, com data e
            hora, o tipo de dispositivo e navegador, a página de origem e o endereço IP apenas em
            forma de código irreversível (hash). Esses registros ficam ligados à sua conta, porque
            medir o uso por perfil é parte do serviço gratuito descrito no cadastro. A finalidade é
            entender o que as pessoas usam e melhorar o produto, com base no consentimento dado no
            cadastro (art. 7º, I) e no legítimo interesse (art. 7º, IX). Nossa meta é guardá-los por
            até 24 meses; ao excluir a conta, eles deixam de apontar para você.
          </li>
          <li>
            <strong>Uso do site, sem conta:</strong> as páginas que você abre e as ações na tela são
            registradas com um identificador aleatório de visitante e de visita (cookies próprios,
            veja abaixo), o tipo de dispositivo e navegador, a página de origem e o IP em forma de
            hash. Esse registro não aponta para o seu nome nem para o seu e-mail, e só passa a se
            ligar a você se você criar uma conta depois. Se o seu navegador enviar o sinal “Não
            rastrear” (DNT) ou Global Privacy Control, não fazemos esse registro. A base legal é o
            legítimo interesse (art. 7º, IX), de saber quais páginas e dados são úteis.
          </li>
          <li>
            <strong>Proteção contra abuso:</strong> o endereço IP de quem envia os formulários de
            newsletter, cadastro, login e recuperação de senha é usado na hora, em memória, para
            limitar tentativas repetidas. Para esse fim ele não é gravado em banco de dados
            (legítimo interesse, art. 7º, IX).
          </li>
          <li>
            <strong>Estatísticas agregadas:</strong> quando uma ferramenta de estatísticas sem
            cookies (como Plausible ou Umami) está ativa, ela conta visitas de forma agregada, sem
            identificar visitantes. É separada do registro de uso descrito acima.
          </li>
        </ul>
        <p>Não vendemos, alugamos nem compartilhamos e-mails para fins de marketing.</p>

        <h2 id="armazenamento">O que fica no seu navegador</h2>
        <p>
          Não usamos cookies de publicidade nem de terceiros. O que o site guarda no seu navegador:
        </p>
        <ul>
          <li>
            <strong>Cookies próprios de medição de uso</strong>, que não saem do nosso domínio: um
            identificador aleatório de visitante (<code>spillway_vid</code>, dura 1 ano) e um de
            visita (<code>spillway_sid</code>, dura 30 minutos). Servem para contar visitas e ligar
            os passos de uma mesma visita, e não são gravados se o seu navegador enviar “Não
            rastrear” ou Global Privacy Control e você não estiver logado.
          </li>
          <li>
            <strong>Cookie de sessão</strong> (<code>spillway_session</code>), estritamente
            necessário: só existe depois que você entra na conta, vale por até 14 dias e é apagado
            quando você sai. A área administrativa, de uso interno, também usa um cookie de sessão
            para o login.
          </li>
          <li>
            <strong>Preferência de tema</strong> claro ou escuro, guardada no{" "}
            <code>localStorage</code>.
          </li>
        </ul>
        <p>
          Se você quiser, pode apagar esses dados nas configurações do navegador; o site continua
          funcionando, e você só precisará entrar de novo na conta.
        </p>

        <h2 id="retencao">Por quanto tempo guardamos</h2>
        <ul>
          <li>
            Inscrição na newsletter não confirmada: apagada depois que o link de confirmação expira
            (48 horas).
          </li>
          <li>Assinatura ativa: enquanto você quiser receber a newsletter.</li>
          <li>
            Conta gratuita: enquanto ela existir. Você pode excluí-la a qualquer momento em “Minha
            conta”, e seus dados de cadastro são apagados. O código de confirmação do e-mail vale 30
            minutos; um cadastro sem confirmação não dá acesso e pode ser refeito ou excluído a seu
            pedido pelo contato acima.
          </li>
          <li>
            Registro de uso: por até 24 meses (meta de retenção). Ao excluir a conta, os registros
            deixam de apontar para você (conta, visitante, IP e navegador são desvinculados).
          </li>
          <li>
            Depois do descadastro: o registro é apagado em até 30 dias. Nesse intervalo ele serve só
            para garantir que você não receba mais e-mails.
          </li>
        </ul>

        <h2 id="operadores">Quem nos ajuda a tratar os dados</h2>
        <p>
          Usamos fornecedores que tratam dados em nosso nome (operadores), apenas para fazer o
          serviço funcionar:
        </p>
        <ul>
          <li>
            <strong>Amazon Web Services</strong>: banco de dados e envio de e-mails (Amazon SES), na
            região de São Paulo (sa-east-1).
          </li>
          <li>
            <strong>Vercel</strong>: hospedagem do site, que pode registrar dados técnicos de acesso
            (como IP) em logs de servidor, possivelmente fora do Brasil, com as garantias previstas
            no art. 33 da LGPD.
          </li>
        </ul>

        <h2 id="direitos">Seus direitos</h2>
        <p>
          Pela LGPD (art. 18), você pode pedir a confirmação de que tratamos seus dados, acesso,
          correção, eliminação, informação sobre compartilhamento e revogação do consentimento a
          qualquer momento.
        </p>
        <ul>
          <li>
            Para revogar o consentimento, use o link <em>Descadastrar</em> presente em todo e-mail
            ou a página <Link href="/newsletter/descadastrar">cancelar newsletter</Link>. O
            descadastro vale na hora, em um clique.
          </li>
          <li>
            Para os demais pedidos
            {contact ? (
              <>
                , escreva para <a href={`mailto:${contact}`}>{contact}</a>
              </>
            ) : (
              ", use o contato indicado acima"
            )}
            . Respondemos em até 15 dias.
          </li>
          <li>
            Você também pode reclamar à Autoridade Nacional de Proteção de Dados (
            <a href="https://www.gov.br/anpd/" rel="noopener noreferrer" target="_blank">
              ANPD
            </a>
            ).
          </li>
        </ul>

        <h2 id="seguranca">Segurança</h2>
        <p>
          A conexão com o site é criptografada (HTTPS). O banco de dados fica em rede privada. As
          senhas são guardadas só como hash com sal (scrypt), e os códigos de confirmação, os links
          de descadastro e as chaves de sessão são guardados apenas como hash.
        </p>

        <h2 id="mudancas">Mudanças nesta política</h2>
        <p>
          Se esta política mudar, a data no topo da página será atualizada. Mudanças que afetem o
          uso do seu e-mail serão avisadas na própria newsletter.
        </p>
      </div>
    </Container>
  );
}
