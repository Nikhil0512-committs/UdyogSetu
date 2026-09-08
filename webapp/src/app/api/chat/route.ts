import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Mock database of schemes injected directly into the prompt
const SCHEME_DATABASE = `
1. Chief Minister Employment Generation Programme (CMEGP): 
   - Purpose: Financial assistance for setting up micro/small enterprises.
   - Max Project Cost: 50 Lakhs for manufacturing, 20 Lakhs for services.
   - Age Limit: 18-45 years.
   - Subsidy: 15% to 35% depending on category (SC/ST/Women get higher).

2. Package Scheme of Incentives (PSI):
   - Purpose: Industrial development in underdeveloped regions of Maharashtra (Vidarbha, Marathwada).
   - Benefits: SGST refund, electricity duty exemption, stamp duty exemption.
   - Eligibility: New MSMEs or large scale units in D, D+, or No Industry Districts.

3. PM Formalisation of Micro food processing Enterprises (PM-FME):
   - Purpose: Support for individual micro food processing units.
   - Subsidy: 35% credit-linked capital subsidy (max 10 Lakhs).
   - Eligibility: Must be an existing micro food processing unit or starting a new one.

4. Mahila Udyam Nidhi Scheme:
   - Purpose: Financial assistance for women entrepreneurs to set up new SSI units.
   - Max Loan: Up to 10 Lakhs.
   - Focus: Upgradation, modernization, and scaling.
`;

const SYSTEM_PROMPT = `
You are "UdyogSetu AI", an official government assistant for the Government of Maharashtra.
Your goal is to help users (farmers, small business owners, aspiring entrepreneurs) figure out which industrial schemes they are eligible for.

Here is the official scheme database you must recommend from:
${SCHEME_DATABASE}

Rules:
1. Be extremely polite, professional, and helpful.
2. Only recommend schemes from the provided database. If their requirement doesn't match, politely explain that you can only assist with the current active schemes.
3. If the user speaks in English, reply in English.
4. If the user speaks in Marathi (or asks for Marathi), you MUST reply in fluent, natural Marathi (Devanagari script).
5. Keep your responses concise and easy to read using bullet points. Do not write massive walls of text.
6. Ask clarifying questions if you need to narrow down their eligibility (e.g., "What is your budget?", "Are you in manufacturing or food processing?").
`;

export async function POST(req: Request) {
  const { messages, pathname } = await req.json();

  let contextPrompt = "The user is browsing the platform.";
  if (pathname === "/dashboard") {
    contextPrompt = "The user is currently on the Dashboard page. This page gives them an overview of their business profile and recent activity.";
  } else if (pathname === "/dashboard/applications") {
    contextPrompt = "The user is currently on the Applications page. Here they can track and manage their permits, licenses, and NOC requests.";
  } else if (pathname === "/dashboard/wallet") {
    contextPrompt = "The user is currently on the Document Wallet page. Here they can securely store and share their verified business documents like PAN, Aadhaar, and GST.";
  } else if (pathname === "/dashboard/schemes") {
    contextPrompt = "The user is currently on the Schemes page. Here they can discover and apply for government subsidies and incentive programs.";
  } else if (pathname === "/dashboard/inspections") {
    contextPrompt = "The user is currently on the Inspections page. Here they can schedule and manage remote video or physical site verifications.";
  } else if (pathname === "/dashboard/grievances") {
    contextPrompt = "The user is currently on the Grievances page. Here they can raise and track complaints regarding delays or issues.";
  }

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    system: `${SYSTEM_PROMPT}\n\n[USER CONTEXT]\n${contextPrompt}\nIf the user asks for help or says they are stuck, provide helpful guidance relevant to this specific page context.`,
    messages,
  });

  return result.toDataStreamResponse();
}
