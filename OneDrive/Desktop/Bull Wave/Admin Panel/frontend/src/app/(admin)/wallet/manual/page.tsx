"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Save, UserSearch } from "lucide-react";
import { useState } from "react";

export default function ManualCreditDebitPage() {
  const [transactionType, setTransactionType] = useState<"credit" | "debit">("credit");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manual Credit & Debit</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manually adjust user wallet balances for refunds, bonuses, or penalties.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Enter details to process manual adjustment</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* User Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select User (Email or User ID)</label>
              <div className="relative">
                <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. rajesh@example.com" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transaction Type</label>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setTransactionType("credit")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    transactionType === "credit" 
                      ? "bg-white dark:bg-[#111111] text-emerald-600 shadow-sm border border-emerald-500/20" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Credit (+)
                </button>
                <button 
                  onClick={() => setTransactionType("debit")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    transactionType === "debit" 
                      ? "bg-white dark:bg-[#111111] text-red-600 shadow-sm border border-red-500/20" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Debit (-)
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks (Mandatory)</label>
              <textarea 
                rows={3}
                placeholder="e.g. Refund for cancelled game session #542" 
                className="w-full p-4 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            {/* Submit */}
            <button className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              transactionType === "credit"
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
            }`}>
              <Save className="w-5 h-5" />
              Process {transactionType === "credit" ? "Credit" : "Debit"}
            </button>

          </CardContent>
        </Card>

        {/* Audit Log / Guidelines side panel */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-white/5 bg-amber-50/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-base text-amber-800">Guidelines for Manual Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700/80 space-y-3 leading-relaxed">
              <p>• <strong>Credits</strong> immediately increase user playable balance. Used typically for dispute resolutions or marketing bonuses.</p>
              <p>• <strong>Debits</strong> forcefully reduce user balance. Only use for penalty deductions or reversing accidental credits.</p>
              <p>• <strong>Remarks</strong> are mandatory and will be visible on the user's transaction history.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
