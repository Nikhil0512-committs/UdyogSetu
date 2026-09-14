import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="animate-pulse bg-slate-200 rounded h-8 w-64" />
          <div className="animate-pulse bg-slate-200 rounded h-4 w-96" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card Skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="animate-pulse bg-slate-200 rounded h-4 w-24" />
              <div className="animate-pulse bg-slate-200 rounded h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="animate-pulse bg-slate-200 rounded h-8 w-16 mb-2" />
              <div className="animate-pulse bg-slate-200 rounded h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="animate-pulse bg-slate-200 rounded h-6 w-48 mb-2" />
            <div className="animate-pulse bg-slate-200 rounded h-4 w-64" />
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100">
            <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm">Loading dashboard content...</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="animate-pulse bg-slate-200 rounded h-6 w-32 mb-2" />
            <div className="animate-pulse bg-slate-200 rounded h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="animate-pulse bg-slate-200 rounded h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="animate-pulse bg-slate-200 rounded h-4 w-full" />
                  <div className="animate-pulse bg-slate-200 rounded h-3 w-3/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
