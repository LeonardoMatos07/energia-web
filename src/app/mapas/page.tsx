import { redirect } from "next/navigation";

/** /mapas is open and sends everyone to the first layer, which decides who sees what. */
export default function MapsIndexPage(): never {
  redirect("/mapas/estados");
}
