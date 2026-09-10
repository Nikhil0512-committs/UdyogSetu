import { requireAuth } from "@/lib/auth";
import ApplyClientPage from "./client-page";
import { fetchWalletDocuments } from "@/actions/wallet";

export default async function ApplyPage() {
  const session = await requireAuth("APPLICANT");
  
  // Fetch existing wallet documents for this user
  const walletDocs = await fetchWalletDocuments(session.userId);

  const isDummyAccount = session.email === "admin@company.com" || session.email === "admin@acme.com" || session.userId === "admin@company.com" || session.userId === "admin@acme.com";
  const defaultCompanyName = isDummyAccount ? "M/S Rahul Sharma Industries" : (session.companyName || `${session.name || "Applicant"}'s Enterprise`);

  return <ApplyClientPage walletDocs={walletDocs} defaultCompanyName={defaultCompanyName} />;
}

