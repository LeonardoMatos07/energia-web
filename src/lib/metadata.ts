import type { Metadata } from "next";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      type: opts.type ?? "website",
      locale: "pt_BR",
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
