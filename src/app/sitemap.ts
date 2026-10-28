import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Only what is open to anyone: the home page, the method, sign-up and privacy. The data pages
 * are for members and stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/metodologia"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/cadastro"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/privacidade"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
