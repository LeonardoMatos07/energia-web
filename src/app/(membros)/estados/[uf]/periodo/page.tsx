import type { Metadata } from "next";
import { StateView, stateMetadata } from "@/components/views/state-view";

export const dynamic = "force-dynamic";

type Params = { uf: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return stateMetadata((await params).uf, true);
}

export default async function StatePeriodPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <StateView stateCode={(await params).uf} query={await searchParams} />;
}
