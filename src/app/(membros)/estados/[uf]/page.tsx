import type { Metadata } from "next";
import { StateView, stateMetadata } from "@/components/views/state-view";

export const revalidate = 3600;

type Params = { uf: string };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return stateMetadata((await params).uf);
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  return <StateView stateCode={(await params).uf} query={{}} />;
}
