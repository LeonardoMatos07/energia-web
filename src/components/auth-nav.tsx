"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/auth-actions";

type SessionState = { member: { name: string; email: string } | null } | null;

export function AuthNav() {
  const [session, setSession] = useState<SessionState>(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<SessionState>)
      .then((body) => {
        if (active) setSession(body);
      })
      .catch(() => {
        if (active) setSession({ member: null });
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  if (session === null) return <div className="h-9 w-40" aria-hidden />;

  if (session.member) {
    const firstName = session.member.name.split(" ")[0];
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/conta"
          className="text-ink-2 hover:text-ink hidden font-medium sm:inline"
          title={session.member.email}
        >
          Olá, {firstName}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="border-line hover:border-accent hover:bg-accent-soft rounded-full border px-3 py-1.5 font-medium"
          >
            Sair
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link href="/entrar" className="text-ink-2 hover:text-ink px-2 py-1.5 font-medium">
        Entrar
      </Link>
      <Link
        href="/cadastro"
        className="bg-accent text-on-accent rounded-full px-3.5 py-1.5 font-semibold hover:opacity-90"
      >
        Criar conta
      </Link>
    </div>
  );
}
