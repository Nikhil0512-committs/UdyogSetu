import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const KNOWN_DOC_KEYWORDS = [
  "pan", "income", "tax",
  "gst", "gstin", "tax_reg",
  "udyam", "incorporation", "msme", "cert", "inc", "registration",
  "land", "lease", "712", "7-12", "khatoni", "ownership", "rent", "deed",
  "site", "layout", "building", "plan", "drawing", "map", "cad",
  "project", "manufacturing", "process", "report", "flow", "dpr",
  "aadhaar", "aadhar", "uid", "signatory",
  "fire", "noc",
  "pollution", "mpcb", "consent", "cte",
  "labour", "shop", "establishment", "worker"
];



// Extract raw text segments directly from PDF stream buffer
function extractTextFromPdfBase64(base64Data: string): string {
  try {
    const cleanBase64 = base64Data.replace(/^data:\w+\/[\w-+]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const rawStr = buffer.toString("binary");
    
    const textSegments = rawStr.match(/\(([^()]{3,100})\)/g);
    if (textSegments) {
      return textSegments.map(s => s.slice(1, -1)).join(" ");
    }
  } catch (e) {
    console.warn("PDF stream parse warning:", e);
  }
  return "";
}

function classifyByTextOrFilename(text: string, fileName: string): string | null {
  const content = (text + " " + fileName).toLowerCase();

  const panRegex = /[a-z]{5}\d{4}[a-z]/i;
  const gstinRegex = /\d{2}[a-z]{5}\d{4}[a-z]\d[z][a-z0-9]/i;
  const udyamRegex = /udyam-[a-z]{2}-\d{2}-\d{7}/i;

  if (panRegex.test(content) || content.includes("income tax") || content.includes("permanent account number") || content.includes("pan card") || content.includes("govt. of india")) {
    return "PAN card (Company/Proprietor)";
  }
  if (gstinRegex.test(content) || content.includes("gstin") || content.includes("gst reg") || content.includes("goods and services tax") || content.includes("tax registration")) {
    return "GST Registration Certificate";
  }
  if (udyamRegex.test(content) || content.includes("udyam") || content.includes("micro, small") || content.includes("msme") || content.includes("certificate of incorporation")) {
    return "Certificate of Incorporation / Udyam";
  }
  if (content.includes("7/12") || content.includes("7-12") || content.includes("khatoni") || content.includes("lease") || content.includes("land allotment") || content.includes("ownership deed")) {
    return "Land Ownership / Lease Allotment";
  }
  if (content.includes("site plan") || content.includes("layout plan") || content.includes("building plan") || content.includes("architectural drawing") || content.includes("floor plan")) {
    return "Site Layout Plan / Building Plan Drawing";
  }
  if (content.includes("project report") || content.includes("manufacturing process") || content.includes("detailed project") || content.includes("process flow")) {
    return "Project Report / Manufacturing Process Details";
  }
  if (content.includes("aadhaar") || content.includes("aadhar") || content.includes("uidai") || content.includes("unique identification")) {
    return "Aadhaar of Authorized Signatory";
  }
  if (content.includes("fire noc") || content.includes("fire services") || content.includes("provisional fire")) {
    return "Provisional Fire NOC";
  }
  if (content.includes("mpcb") || content.includes("pollution control") || content.includes("consent to establish")) {
    return "Consent to Establish (Water & Air)";
  }
  if (content.includes("shops and establishment") || content.includes("labour department") || content.includes("factories act")) {
    return "Shops & Establishment Registration";
  }

  return null;
}

function extractCompanyFromText(text: string): string {
  const companyRegex = /([A-Z0-9\s&.\-]{3,40}(?:Pvt|Private|Ltd|Limited|Industries|Enterprises|Services|Works|Co|Corporation|Traders))/i;
  const match = text.match(companyRegex);
  if (match && match[1].trim().length > 3) {
    return match[1].trim();
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { fileBase64, fileName, mimeType, targetDocName } = await req.json();

    if (!fileBase64 && !fileName) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }



    // Extract text from PDF buffer if PDF
    const pdfText = (mimeType === "application/pdf" || fileName?.endsWith(".pdf")) ? extractTextFromPdfBase64(fileBase64) : "";
    
    // Classify by PDF text or filename
    let detectedDocKey = targetDocName || classifyByTextOrFilename(pdfText, fileName) || "";

    // Extract regex patterns from PDF text or filename
    let extractedPan = "";
    let extractedGstin = "";
    let extractedCompany = extractCompanyFromText(pdfText);
    let extractedAddress = "";

    const combinedText = pdfText + " " + fileName;
    const panMatch = combinedText.match(/[a-z]{5}\d{4}[a-z]/i);
    if (panMatch) extractedPan = panMatch[0].toUpperCase();

    const gstinMatch = combinedText.match(/\d{2}[a-z]{5}\d{4}[a-z]\d[z][a-z0-9]/i);
    if (gstinMatch) extractedGstin = gstinMatch[0].toUpperCase();

    // Multimodal Gemini 1.5 Flash Vision Inspection
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (apiKey && fileBase64) {
      try {
        const cleanBase64 = fileBase64.replace(/^data:\w+\/[\w-+]+;base64,/, "");
        const isPdf = mimeType === "application/pdf" || fileName?.endsWith(".pdf");
        
        const systemPrompt = `You are an expert Indian Business Document Classifier & OCR Extractor.
Analyze the document. Extract ONLY text that is actually printed on the document.

If the image is irrelevant or non-document, return "isIrrelevant": true.

Otherwise, extract:
- documentType (one of: PAN card (Company/Proprietor), Certificate of Incorporation / Udyam, GST Registration Certificate, Land Ownership / Lease Allotment, Site Layout Plan / Building Plan Drawing, Project Report / Manufacturing Process Details, Aadhaar of Authorized Signatory, Provisional Fire NOC, Consent to Establish (Water & Air), Shops & Establishment Registration)
- companyName (exact company name on document if present, otherwise empty string "")
- pan (exact 10-char PAN if explicitly present on document, otherwise empty string "")
- gstin (exact 15-char GSTIN if explicitly present on document, otherwise empty string "")
- address (exact address if present, otherwise empty string "")

Respond ONLY in JSON format:
{
  "documentType": string,
  "isIrrelevant": boolean,
  "companyName": string,
  "pan": string,
  "gstin": string,
  "address": string
}`;

        const fileContentPart = isPdf
          ? { type: "file" as const, mimeType: "application/pdf", data: cleanBase64 }
          : { type: "image" as const, image: cleanBase64 };

        const result = await generateText({
          model: google("gemini-flash-lite-latest"),
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Analyze and extract text from file: ${fileName}` },
                fileContentPart,
              ],
            },
          ],
        });

        const resultText = result.text;
        
        // Aggressive Regex sweep on raw AI output for PAN and GSTIN
        const rawPanMatch = resultText.match(/[A-Z]{5}\d{4}[A-Z]/i);
        if (rawPanMatch) extractedPan = rawPanMatch[0].toUpperCase();
        
        const rawGstMatch = resultText.match(/\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]/i);
        if (rawGstMatch) extractedGstin = rawGstMatch[0].toUpperCase();

        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if ((parsed.isIrrelevant || parsed.documentType === "IRRELEVANT_DOCUMENT") && !targetDocName) {
            return NextResponse.json({
              success: false,
              isIrrelevant: true,
              error: "Unrecognized or irrelevant image. Please upload a valid business document."
            }, { status: 400 });
          }
          if (parsed.documentType && !targetDocName) detectedDocKey = parsed.documentType;
          if (parsed.companyName && parsed.companyName.length > 2) extractedCompany = parsed.companyName;
          if (parsed.pan && parsed.pan.length === 10) extractedPan = parsed.pan;
          if (parsed.gstin && parsed.gstin.length === 15) extractedGstin = parsed.gstin;
          if (parsed.address && parsed.address.length > 5) extractedAddress = parsed.address;
        }
      } catch (geminiError) {
        console.warn("Gemini Vision OCR extraction warning:", geminiError);
      }
    }

    if (!detectedDocKey && !targetDocName) {
      return NextResponse.json({
        success: false,
        isIrrelevant: true,
        error: "Unrecognized or irrelevant document. Please upload a valid business document."
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      documentType: detectedDocKey || "Certificate of Incorporation / Udyam",
      extractedData: {
        companyName: extractedCompany,
        pan: extractedPan,
        gstin: extractedGstin,
        address: extractedAddress,
      },
    });
  } catch (error: any) {
    console.error("OCR API Route Error:", error);
    return NextResponse.json({
      success: false,
      isIrrelevant: true,
      error: "Failed to recognize document. Please upload a valid business document."
    }, { status: 400 });
  }
}
