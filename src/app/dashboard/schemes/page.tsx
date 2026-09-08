import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Filter, Info, Lightbulb, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default async function SchemesPage() {
  const session = await requireAuth("APPLICANT");

  // Mock matched schemes based on applicant profile
  const schemes = [
    {
      id: 1,
      title: "Package Scheme of Incentives (PSI - 2019)",
      department: "Directorate of Industries",
      description: "Financial assistance to MSMEs setting up in developing areas (Zones C, D, D+, No Industry Districts) of Maharashtra.",
      benefits: ["Up to 100% SGST Refund", "Stamp Duty Exemption", "Electricity Duty Exemption"],
      matchScore: 98,
      eligibility: "Manufacturing units in D+ zone (e.g., Gadchiroli, Washim).",
      tags: ["Tax Refund", "Manufacturing"],
      color: "bg-blue-50 border-blue-200 text-blue-900"
    },
    {
      id: 2,
      title: "Chief Minister Employment Generation Programme (CMEGP)",
      department: "MSME Department",
      description: "Credit-linked subsidy program to generate employment opportunities by setting up micro-enterprises in rural and urban areas.",
      benefits: ["Up to 35% Project Cost Subsidy", "Bank Loan Assistance", "Entrepreneurship Training"],
      matchScore: 92,
      eligibility: "Project cost up to ₹50 Lakhs (Manufacturing) / ₹10 Lakhs (Services).",
      tags: ["Subsidy", "Micro Enterprise"],
      color: "bg-emerald-50 border-emerald-200 text-emerald-900"
    },
    {
      id: 3,
      title: "Green Industrial Initiative",
      department: "MPCB & Energy Dept",
      description: "Special incentives for industries adopting Zero Liquid Discharge (ZLD) systems and renewable energy sources.",
      benefits: ["25% Capital Subsidy on Solar", "Fast-track MPCB Approvals", "Water Cess Rebate"],
      matchScore: 85,
      eligibility: "Units installing solar capacity > 50kW or ZLD effluent plants.",
      tags: ["Sustainability", "Energy"],
      color: "bg-green-50 border-green-200 text-green-900"
    },
    {
      id: 4,
      title: "Women Entrepreneurship Subsidy",
      department: "Women & Child Development",
      description: "Additional capital subsidies and lower interest rates for enterprises where >51% equity is held by women.",
      benefits: ["5% Interest Subvention", "Specialized Incubator Access", "Marketing Grant of ₹1 Lakh"],
      matchScore: 75,
      eligibility: "Women-led MSMEs.",
      tags: ["Women-led", "Financial"],
      color: "bg-purple-50 border-purple-200 text-purple-900"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wider uppercase">AI Schemes Matcher</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Incentives & Subsidies</h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Based on your enterprise profile, our Smart Matcher has identified government schemes you are highly eligible for. Applying for these can significantly reduce your capital costs.
          </p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 p-2 rounded-full">
            <Filter className="w-5 h-5 text-blue-700" />
          </div>
          <div className="text-sm">
            <p className="text-slate-500">Matching Profile:</p>
            <p className="font-semibold text-slate-900">Micro • Manufacturing • Pune</p>
          </div>
          <Button variant="outline" size="sm" className="ml-2">Edit Profile</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <Card key={scheme.id} className="flex flex-col h-full border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className={`${scheme.color} rounded-t-xl pb-4`}>
              <div className="flex justify-between items-start gap-4 mb-2">
                <Badge variant="outline" className="bg-white/60 border-slate-300 text-slate-800">
                  {scheme.department}
                </Badge>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm text-xs font-bold text-emerald-700">
                  <TrendingUp className="w-3 h-3" /> {scheme.matchScore}% Match
                </div>
              </div>
              <CardTitle className="text-xl leading-tight">{scheme.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex-grow">
              <p className="text-slate-600 text-sm mb-4">{scheme.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Key Benefits
                  </h4>
                  <ul className="space-y-1.5">
                    {scheme.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Eligibility Criteria
                  </h4>
                  <p className="text-xs text-slate-600">{scheme.eligibility}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-slate-100 mt-4 px-6 py-4 bg-slate-50/50 flex justify-between items-center rounded-b-xl">
              <div className="flex gap-2">
                {scheme.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
              <Link href={`/dashboard/schemes/${scheme.id}`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-900 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Lightbulb className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-300" /> Need Help Understanding Schemes?
          </h3>
          <p className="text-blue-100 text-sm">
            Our AI assistant can analyze your detailed business plan and automatically recommend the exact structural changes needed to maximize your subsidy payouts.
          </p>
        </div>
        <Button className="mt-4 md:mt-0 bg-white text-blue-900 hover:bg-blue-50 relative z-10 whitespace-nowrap">
          Consult AI Advisor
        </Button>
      </div>

    </div>
  );
}
