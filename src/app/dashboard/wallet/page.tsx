import { requireAuth } from "@/lib/auth";
import DocumentWalletClientPage from "./client-page";

export default async function DocumentWalletPage() {
  const session = await requireAuth("APPLICANT");
  
  // Check if the current user is the dummy account used for testing
  const isDummyAccount = session.userId === "admin@company.com" || session.userId === "admin@acme.com";

  return <DocumentWalletClientPage isDummyAccount={isDummyAccount} userId={session.userId} />;
}
