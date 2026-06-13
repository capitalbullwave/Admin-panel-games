import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, UploadCloud } from "lucide-react";

export default function AddGamePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Add New Game</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure parameters for a new game listing.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Game Name</label>
                  <input type="text" placeholder="e.g. Ludo Master" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20">
                    <option>Select Category</option>
                    <option>Casino</option>
                    <option>Card Game</option>
                    <option>Multiplayer</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Entry Fee (₹)</label>
                  <input type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Min Players</label>
                  <input type="number" placeholder="2" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Players</label>
                  <input type="number" placeholder="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description / Rules</label>
                <textarea rows={4} placeholder="Enter game rules..." className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 resize-none"></textarea>
              </div>

            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-lg">Game Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-amber-500/50 hover:bg-amber-50/50 transition-colors cursor-pointer group">
                <div className="h-14 w-14 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:bg-amber-100 mb-4 transition-colors">
                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Thumbnail</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 2MB (1:1 Ratio)</p>
              </div>

              <button className="w-full py-3.5 rounded-xl text-slate-900 dark:text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Save className="w-5 h-5" />
                Publish Game
              </button>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
