import { Container } from "@/components/ui";

export default function MembersLoading() {
  return (
    <Container>
      <div className="animate-pulse pt-8 sm:pt-10" role="status" aria-busy="true">
        <span className="sr-only">Carregando…</span>
        <div className="bg-surface-2 h-3 w-32 rounded" />
        <div className="bg-surface-2 mt-3 h-8 w-64 rounded" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="bg-surface-2 h-24 rounded-lg" />
          <div className="bg-surface-2 h-24 rounded-lg" />
          <div className="bg-surface-2 h-24 rounded-lg" />
        </div>
        <div className="bg-surface-2 mt-6 h-72 rounded-lg" />
      </div>
    </Container>
  );
}
