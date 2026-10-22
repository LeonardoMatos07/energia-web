import type { ReactNode } from "react";
import { requireMember } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function MembersLayout({ children }: { children: ReactNode }) {
  await requireMember();
  return children;
}
