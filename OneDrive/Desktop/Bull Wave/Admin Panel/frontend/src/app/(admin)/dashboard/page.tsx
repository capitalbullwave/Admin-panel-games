import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Wallet, Activity, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Total Users", value: "12,345", icon: Users, trend: "+12.5%", isPositive: true },
    { title: "Active Users", value: "8,234", icon: Activity, trend: "+5.2%", isPositive: true },
    { title: "Total Deposits", value: "$45,231", icon: Wallet, trend: "+18.1%", isPositive: true },
    { title: "Revenue", value: "$12,450", icon: DollarSign, trend: "-4.3%", isPositive: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all duration-300 group overflow-hidden relative">
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/50 to-orange-500/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {stat.title}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-white/80 dark:bg-[#111111]/80 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="flex items-center mt-3">
                  <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {stat.trend}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Revenue Chart */}
        <Card className="col-span-4 border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] flex items-center justify-center text-slate-500 dark:text-slate-400 bg-gradient-to-b from-white/5 to-transparent m-6 border border-dashed border-slate-200 dark:border-white/5 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-center relative z-10">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 text-slate-400 group-hover:text-amber-400/50 transition-colors duration-300" />
                <p className="font-medium">Chart Placeholder</p>
                <p className="text-sm text-slate-400 mt-1">Recharts integration pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activities */}
        <Card className="col-span-3 border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 flex items-center justify-center group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all duration-300 shadow-sm mt-0.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors duration-300">New Deposit</p>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">2m ago</div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">User_{i}92 deposited <span className="text-slate-900 dark:text-white font-semibold">$500</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
