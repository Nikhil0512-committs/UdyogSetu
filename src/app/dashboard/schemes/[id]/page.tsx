import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SchemeApplicationClientPage from "./client-page";

export default async function SchemeApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth("APPLICANT");

  let companyName = "Your Enterprise";
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    if (user?.companyName) {
      companyName = user.companyName;
    } else {
      // Use dummy data only if it is the dummy account, otherwise default
      const isDummyAccount = session.email === "admin@company.com" || session.email === "admin@acme.com" || session.userId === "admin@company.com" || session.userId === "admin@acme.com";
      companyName = isDummyAccount ? "M/S Rahul Sharma Industries" : (session.companyName || `${session.name}'s Enterprise`);
    }
  } catch (err) {
    const isDummyAccount = session.email === "admin@company.com" || session.email === "admin@acme.com" || session.userId === "admin@company.com" || session.userId === "admin@acme.com";
    companyName = isDummyAccount ? "M/S Rahul Sharma Industries" : (session.companyName || `${session.name}'s Enterprise`);
  }

  return (
    <SchemeApplicationClientPage 
      id={id}
      userName={session.name}
      companyName={companyName}
    />
  );
}
