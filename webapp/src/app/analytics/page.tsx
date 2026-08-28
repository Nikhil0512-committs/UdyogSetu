"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { ArrowUpRight, BarChart3, Building2, Clock, Globe, MapPin, Trophy, Users } from "lucide-react";

export default function AnalyticsDashboard() {
  const districtLeaderboard = [
    { rank: 1, name: "Pune", apps: 12450, avgTime: "12 Days", score: 98.5, trend: "up" },
    { rank: 2, name: "Thane", apps: 9820, avgTime: "14 Days", score: 95.2, trend: "up" },
    { rank: 3, name: "Nashik", apps: 6540, avgTime: "15 Days", score: 91.8, trend: "up" },
    { rank: 4, name: "Nagpur", apps: 5120, avgTime: "18 Days", score: 88.4, trend: "down" },
    { rank: 5, name: "Chhatrapati Sambhajinagar", apps: 4890, avgTime: "19 Days", score: 86.1, trend: "up" },
    { rank: 6, name: "Mumbai City", apps: 4100, avgTime: "22 Days", score: 82.3, trend: "down" },
  ];

  const sectorData = [
    { name: 'IT & ITES', value: 4500 },
    { name: 'Manufacturing', value: 3800 },
    { name: 'Food Proc.', value: 2900 },
    { name: 'Textiles', value: 2100 },
    { name: 'Pharma', value: 1800 },
    { name: 'Auto', value: 1500 },
  ];

  const timelineData = [
    { month: 'Jan', approvals: 1200, time: 28 },
    { month: 'Feb', approvals: 1900, time: 26 },
    { month: 'Mar', approvals: 2400, time: 24 },
    { month: 'Apr', approvals: 3100, time: 21 },
    { month: 'May', approvals: 3800, time: 19 },
    { month: 'Jun', approvals: 4500, time: 16 },
    { month: 'Jul', approvals: 5200, time: 14 },
    { month: 'Aug', approvals: 6100, time: 12 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold shadow-sm">U</div>
          <span className="text-xl font-bold tracking-tight">UdyogSetu Analytics</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Portal Home</Link>
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">State Industrial Performance</h1>
            <p className="text-slate-500 mt-1 max-w-2xl">
              Real-time monitoring of industrial growth, approval SLAs, and district-level ease of doing business rankings across Maharashtra.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3">
              <Globe className="w-3.5 h-3.5 mr-1" /> Live Data
            </Badge>
            <Badge variant="outline" className="bg-white text-slate-700 py-1.5 px-3">
              Updated 2 mins ago
            </Badge>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Investments Facilitated</p>
                  <h3 className="text-3xl font-bold text-slate-900">₹42,500<span className="text-xl text-slate-500 font-normal"> Cr</span></h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" /> +24% from last year
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Average Clearance Time</p>
                  <h3 className="text-3xl font-bold text-slate-900">12<span className="text-xl text-slate-500 font-normal"> Days</span></h3>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" /> Down from 45 days in 2024
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Jobs Generated (Est.)</p>
                  <h3 className="text-3xl font-bold text-slate-900">1.2<span className="text-xl text-slate-500 font-normal"> Lakh</span></h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" /> +18% this quarter
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">SLA Compliance Rate</p>
                  <h3 className="text-3xl font-bold text-slate-900">96.8<span className="text-xl text-slate-500 font-normal">%</span></h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-amber-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" /> +5.2% improvement
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Leaderboard Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Leaderboard */}
          <Card className="lg:col-span-1 border-none shadow-sm flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-amber-500" /> District Leaderboard
              </CardTitle>
              <CardDescription>Ranked by Ease of Doing Business score & processing speed.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="divide-y divide-slate-100">
                {districtLeaderboard.map((dist, i) => (
                  <div key={dist.name} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' : 
                        i === 1 ? 'bg-slate-200 text-slate-700' : 
                        i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {dist.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{dist.name}</p>
                        <p className="text-xs text-slate-500">{dist.apps.toLocaleString()} approvals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">{dist.score}</p>
                      <p className={`text-xs ${dist.avgTime === '12 Days' ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>{dist.avgTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Timeline Chart */}
            <Card className="border-none shadow-sm flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Approvals vs. Processing Time</CardTitle>
                <CardDescription>Impact of the new AI regulatory engine on state-wide processing.</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="approvals" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApprovals)" name="Total Approvals" />
                    <Line yAxisId="right" type="monotone" dataKey="time" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Avg Time (Days)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Bar Chart */}
            <Card className="border-none shadow-sm flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Sectors by Growth</CardTitle>
                <CardDescription>Volume of new enterprise applications by industry sector.</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} name="New Enterprises" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
