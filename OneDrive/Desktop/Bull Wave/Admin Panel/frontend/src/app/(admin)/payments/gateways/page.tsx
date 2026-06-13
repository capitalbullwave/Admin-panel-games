import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, MoreVertical, Server, Power, PowerOff } from "lucide-react";

export default function PaymentGatewaysPage() {
  const gateways = [
    {
      "Name": "Razorpay",
      "Provider": "Razorpay Software Pvt. Ltd.",
      "Status": "Active",
      "Key": "rzp_live_*************",
      "Added": "3 Months ago"
    },
    {
      "Name": "Stripe International",
      "Provider": "Stripe, Inc.",
      "Status": "Inactive",
      "Key": "sk_live_*************",
      "Added": "5 Months ago"
    },
    {
      "Name": "PhonePe PG",
      "Provider": "PhonePe",
      "Status": "Active",
      "Key": "pg_live_*************",
      "Added": "1 Month ago"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Payment Gateways</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure and manage active payment integrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add Gateway
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gateway, i) => (
          <Card key={i} className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden group">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-sm">
                  <Server className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{gateway["Name"]}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{gateway["Provider"]}</p>
                </div>
              </div>
              <button className="p-1 rounded-md hover:bg-slate-200 transition-colors">
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full text-xs ${
                  gateway["Status"] === "Active" 
                    ? "bg-emerald-500/20 text-emerald-600" 
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {gateway["Status"] === "Active" ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                  {gateway["Status"]}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">API Key</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{gateway["Key"]}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-white/5 pt-3">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Added</span>
                <span className="text-slate-700 dark:text-slate-300">{gateway["Added"]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
