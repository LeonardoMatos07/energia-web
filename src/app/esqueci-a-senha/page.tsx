import { RecoverPasswordForm } from "@/components/auth-forms";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Esqueci a senha",
  description: "Peça um código para criar uma nova senha do Spillway.",
  path: "/esqueci-a-senha",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <Container>
      <PageHeader title="Esqueci a senha">
        <p>
          Informe o e-mail do cadastro. Enviaremos um código de 6 dígitos para você criar uma nova
          senha.
        </p>
      </PageHeader>
      <div className="max-w-md pb-12">
        <RecoverPasswordForm />
      </div>
    </Container>
  );
}
