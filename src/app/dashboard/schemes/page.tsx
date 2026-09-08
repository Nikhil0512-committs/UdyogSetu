import { requireAuth } from "@/lib/auth";
import { SchemesClient } from "./schemes-client";

export default async function SchemesPage() {
  await requireAuth("APPLICANT");

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SchemesClient />
    </div>
  );
}
