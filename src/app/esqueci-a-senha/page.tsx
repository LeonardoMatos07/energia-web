import { ForgotPasswordForm } from "@/components/auth-forms";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Esqueci a senha",
  description: "Peça um link para criar uma nova senha do Spillway.",
  path: "/esqueci-a-senha",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <Container>
      <PageHeader title="Esqueci a senha">
        <p>Informe o e-mail do cadastro e enviaremos um link para criar uma nova senha.</p>
      </PageHeader>
      <div className="max-w-md pb-12">
        <ForgotPasswordForm />
      </div>
    </Container>
  );
}
