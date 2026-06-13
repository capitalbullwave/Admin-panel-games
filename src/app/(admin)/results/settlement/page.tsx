import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Activity } from "lucide-react";

export default function SettlementProcessingPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settlement Processing</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor the automated payout engine and retry failed settlements.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" /> Engine Status
            </CardTitle>
            <CardDescription>Current state of the automated settlement engine</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center p-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl mb-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <div className="h-10 w-10 bg-emerald-500 rounded-full animate-pulse flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Engine Running</h3>
                <p className="text-emerald-600 font-semibold text-sm">Processing 2 jobs/sec</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Queue Size</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">0</p>
              </div>
              <div className="p-4 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Avg Process Time</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">1.2s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
            <CardTitle className="text-red-600">Failed Settlements</CardTitle>
            <CardDescription>Payouts that failed due to validation or server errors</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No failed settlements!</p>
              <p className="text-sm">All declared games have been successfully processed and wallets updated.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
