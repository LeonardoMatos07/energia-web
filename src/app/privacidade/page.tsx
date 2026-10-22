import Link from "next/link";
import { Container, Notice, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { getContactEmail, SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Política de privacidade",
  description: `Quais dados pessoais o ${SITE_NAME} trata, para quê, por quanto tempo e como exercer seus direitos pela LGPD.`,
  path: "/privacidade",
});

const UPDATED_AT = "21 de outubro de 2026";

export default function PrivacyPage() {
  const contact = getContactEmail();

  return (
    <Container>
      <PageHeader title="Política de privacidade">
        <p>Última atualização: {UPDATED_AT}.</p>
      </PageHeader>

      <div className="prose prose-site max-w-3xl">
        <p>
          O {SITE_NAME} é um portal aberto: você não precisa de conta para ver nenhum dado. O único
          dado pessoal que tratamos é o e-mail de quem assina a newsletter. Esta página explica esse
          tratamento conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).
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
            <strong>Proteção contra abuso:</strong> o endereço IP de quem envia o formulário da
            newsletter é usado na hora, em memória, para limitar tentativas repetidas. Ele não é
            gravado em banco de dados (legítimo interesse, art. 7º, IX).
          </li>
          <li>
            <strong>Estatísticas de visitas:</strong> quando ativas, são agregadas, sem cookies e
            sem identificar visitantes.
          </li>
        </ul>
        <p>Não vendemos, alugamos nem compartilhamos e-mails para fins de marketing.</p>

        <h2 id="armazenamento">O que fica no seu navegador</h2>
        <p>
          Não usamos cookies de rastreamento. O site guarda no seu navegador apenas a preferência de
          tema claro ou escuro (<code>localStorage</code>). Quando você entra na sua conta, o site
          grava um cookie de sessão estritamente necessário (<code>spillway_session</code>), que
          vale por até 14 dias e é apagado quando você sai. A área administrativa, de uso interno,
          também usa um cookie de sessão para o login.
        </p>

        <h2 id="retencao">Por quanto tempo guardamos</h2>
        <ul>
          <li>
            Inscrição não confirmada: apagada depois que o link de confirmação expira (48 horas).
          </li>
          <li>Assinatura ativa: enquanto você quiser receber a newsletter.</li>
          <li>
            Conta gratuita: enquanto ela existir. Você pode excluí-la a qualquer momento em “Minha
            conta”, e seus dados de cadastro são apagados. Cadastros cujo e-mail não foi confirmado
            em 48 horas deixam de ter validade.
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
          A conexão com o site é criptografada (HTTPS). O banco de dados fica em rede privada, e os
          links de confirmação e de descadastro são guardados apenas como hash.
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
