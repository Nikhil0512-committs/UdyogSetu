const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "admin@acme.com";
  const user = await prisma.user.findUnique({
    where: { email }
  });
  console.log("User:", user);
  if (user) {
    const apps = await prisma.application.findMany({
      where: { applicantId: user.id }
    });
    console.log("Applications for CUID:", apps.length);
  }
  const fallbackApps = await prisma.application.findMany({
    where: { applicantId: email }
  });
  console.log("Applications for email ID:", fallbackApps.length);
  
  // also check admin@company.com
  const user2 = await prisma.user.findUnique({
    where: { email: "admin@company.com" }
  });
  console.log("User2:", user2);
  if (user2) {
    const apps2 = await prisma.application.findMany({
      where: { applicantId: user2.id }
    });
    console.log("Applications for CUID2:", apps2.length);
  }
  const fallbackApps2 = await prisma.application.findMany({
    where: { applicantId: "admin@company.com" }
  });
  console.log("Applications for email ID2:", fallbackApps2.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
