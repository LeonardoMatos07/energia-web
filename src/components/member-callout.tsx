"use client";

import Link from "next/link";
import { useEffect } from "react";
import { refreshSession, useSession } from "@/lib/session-store";

export function MemberCallout({ className = "" }: { className?: string }) {
  const session = useSession();

  useEffect(() => {
    if (session === null) void refreshSession();
  }, [session]);

  if (session?.member) return null;

  return (
    <aside
      aria-label="Conta gratuita"
      className={`border-accent bg-accent-soft rounded-2xl border p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 ${className}`}
    >
      <p className="text-accent-strong font-semibold">
        Crie uma conta grátis para comparar usinas, ver a série horária e exportar.
      </p>
      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-3 sm:mt-0">
        <Link
          href="/cadastro"
          data-track="cta.public_signup"
          className="bg-accent text-on-accent rounded-full px-5 py-2 text-sm font-semibold hover:opacity-90"
        >
          Criar conta grátis
        </Link>
        <Link href="/entrar" className="text-accent-strong text-sm font-medium underline">
          Já tenho conta
        </Link>
      </div>
    </aside>
  );
}
