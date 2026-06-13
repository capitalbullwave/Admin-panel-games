const fs = require('fs');
const path = require('path');

const pages = {
    "users": {
        title: "User Management",
        description: "Manage platform users, view their balances and status.",
        columns: ["Name", "Email", "Mobile", "Balance", "Status", "Joined"],
        data: [
            {Name: "Rajesh Kumar", Email: "rajesh@example.com", Mobile: "+91 9876543210", Balance: "₹4,500", Status: "Active", Joined: "2 Days ago"},
            {Name: "Amit Singh", Email: "amit.s@example.com", Mobile: "+91 9988776655", Balance: "₹12,000", Status: "Active", Joined: "1 Week ago"},
            {Name: "Priya Sharma", Email: "priya99@example.com", Mobile: "+91 9123456789", Balance: "₹350", Status: "Blocked", Joined: "1 Month ago"},
            {Name: "Vikram Patel", Email: "vikram.p@example.com", Mobile: "+91 9876512345", Balance: "₹8,900", Status: "Active", Joined: "3 Months ago"},
            {Name: "Neha Gupta", Email: "neha.g@example.com", Mobile: "+91 9001122334", Balance: "₹1,200", Status: "Active", Joined: "5 Months ago"},
        ]
    },
    "kyc": {
        title: "KYC Management",
        description: "Review and approve user KYC submissions.",
        columns: ["User", "Document Type", "Document Number", "Submitted", "Status"],
        data: [
            {User: "Amit Singh", "Document Type": "Aadhaar Card", "Document Number": "XXXX-XXXX-1234", Submitted: "2 Hours ago", Status: "Pending"},
            {User: "Rajesh Kumar", "Document Type": "PAN Card", "Document Number": "ABCDE1234F", Submitted: "1 Day ago", Status: "Approved"},
            {User: "Priya Sharma", "Document Type": "Aadhaar Card", "Document Number": "XXXX-XXXX-9876", Submitted: "3 Days ago", Status: "Rejected"},
        ]
    },
    "wallet": {
        title: "Wallet Management",
        description: "Monitor deposits, withdrawals, and platform liquidity.",
        columns: ["Transaction ID", "User", "Type", "Amount", "Method", "Date", "Status"],
        data: [
            {"Transaction ID": "TXN-98234", User: "Vikram Patel", Type: "Deposit", Amount: "₹5,000", Method: "UPI", Date: "10 Mins ago", Status: "Completed"},
            {"Transaction ID": "TXN-98233", User: "Neha Gupta", Type: "Withdrawal", Amount: "₹2,000", Method: "Bank Transfer", Date: "1 Hour ago", Status: "Pending"},
            {"Transaction ID": "TXN-98232", User: "Rajesh Kumar", Type: "Deposit", Amount: "₹1,000", Method: "Card", Date: "3 Hours ago", Status: "Failed"},
        ]
    },
    "payments": {
        title: "Payment Management",
        description: "Manage payment gateways and manual adjustments.",
        columns: ["Gateway", "Provider", "Success Rate", "Total Processed", "Status"],
        data: [
            {Gateway: "UPI Primary", Provider: "Razorpay", "Success Rate": "98.5%", "Total Processed": "₹1,24,50,000", Status: "Active"},
            {Gateway: "Card Payments", Provider: "Stripe", "Success Rate": "95.2%", "Total Processed": "₹45,20,000", Status: "Active"},
            {Gateway: "Net Banking", Provider: "Cashfree", "Success Rate": "92.1%", "Total Processed": "₹12,80,000", Status: "Maintenance"},
        ]
    },
    "games": {
        title: "Game Management",
        description: "Configure games, entry fees, and status.",
        columns: ["Game ID", "Name", "Category", "Entry Fee", "Active Players", "Status"],
        data: [
            {"Game ID": "G-101", Name: "Color Prediction", Category: "Prediction", "Entry Fee": "₹10 - ₹10,000", "Active Players": "1,245", Status: "Active"},
            {"Game ID": "G-102", Name: "Aviator", Category: "Crash", "Entry Fee": "₹50 - ₹5,000", "Active Players": "892", Status: "Active"},
            {"Game ID": "G-103", Name: "Roulette", Category: "Casino", "Entry Fee": "₹100+", "Active Players": "341", Status: "Maintenance"},
        ]
    },
    "results": {
        title: "Result Management",
        description: "Declare game results and manage payouts.",
        columns: ["Match ID", "Game", "Outcome", "Total Bets", "Payout", "Declared At"],
        data: [
            {"Match ID": "M-8821", Game: "Color Prediction", Outcome: "Red (8)", "Total Bets": "₹45,200", Payout: "₹38,400", "Declared At": "2 Mins ago"},
            {"Match ID": "M-8820", Game: "Color Prediction", Outcome: "Green (3)", "Total Bets": "₹52,100", Payout: "₹48,900", "Declared At": "5 Mins ago"},
            {"Match ID": "M-8819", Game: "Color Prediction", Outcome: "Violet (0)", "Total Bets": "₹31,000", Payout: "₹12,000", "Declared At": "8 Mins ago"},
        ]
    },
    "support": {
        title: "Customer Support",
        description: "Manage user support tickets and inquiries.",
        columns: ["Ticket ID", "User", "Subject", "Priority", "Created", "Status"],
        data: [
            {"Ticket ID": "TKT-1023", User: "Amit Singh", Subject: "Withdrawal Delayed", Priority: "High", Created: "1 Hour ago", Status: "Open"},
            {"Ticket ID": "TKT-1022", User: "Priya Sharma", Subject: "Account Blocked", Priority: "Critical", Created: "5 Hours ago", Status: "In Progress"},
            {"Ticket ID": "TKT-1021", User: "Rajesh Kumar", Subject: "Game Glitch", Priority: "Medium", Created: "1 Day ago", Status: "Resolved"},
        ]
    },
    "reports": {
        title: "Reports & Analytics",
        description: "View detailed platform analytics and financial reports.",
        columns: ["Report Name", "Generated By", "Format", "Size", "Date"],
        data: [
            {"Report Name": "Monthly Revenue (May)", "Generated By": "System", Format: "PDF", Size: "2.4 MB", Date: "1st June"},
            {"Report Name": "User Growth Q1", "Generated By": "Admin", Format: "Excel", Size: "1.1 MB", Date: "15th April"},
            {"Report Name": "Tax Audit 2025", "Generated By": "Finance Admin", Format: "PDF", Size: "8.5 MB", Date: "31st March"},
        ]
    },
    "roles": {
        title: "Roles & Permissions",
        description: "Manage admin roles and access control.",
        columns: ["Admin", "Email", "Role", "Last Login", "Status"],
        data: [
            {Admin: "Super Admin", Email: "admin@bullwave.com", Role: "Super Admin", "Last Login": "Just now", Status: "Active"},
            {Admin: "Finance Manager", Email: "finance@bullwave.com", Role: "Finance", "Last Login": "2 Hours ago", Status: "Active"},
            {Admin: "Support Lead", Email: "support@bullwave.com", Role: "Support", "Last Login": "1 Day ago", Status: "Active"},
        ]
    },
    "settings": {
        title: "System Settings",
        description: "Configure global platform settings and parameters.",
        columns: ["Setting Category", "Description", "Last Updated", "Status"],
        data: [
            {"Setting Category": "General", Description: "Platform name, logo, timezone", "Last Updated": "1 Month ago", Status: "Active"},
            {"Setting Category": "Referral Program", Description: "Commission rates and levels", "Last Updated": "2 Weeks ago", Status: "Active"},
            {"Setting Category": "Maintenance", Description: "System downtime toggle", "Last Updated": "3 Months ago", Status: "Inactive"},
        ]
    }
};

const getTemplate = (compName, title, description, columnsList, rowRendersStr, dataJson, lenData) => `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Filter, MoreVertical } from "lucide-react";

export default function ${compName}() {
  const data = ${dataJson};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">${title}</h2>
          <p className="text-sm text-slate-400 mt-1">${description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.02] flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                <tr>
                  ${columnsList}
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    ${rowRendersStr}
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10">
            <span className="text-sm text-slate-400">Showing 1 to ${lenData} of ${lenData} entries</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 text-sm">Prev</button>
              <button className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm">1</button>
              <button className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-sm">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

const baseDir = path.join(__dirname, 'src', 'app', 'dashboard');

for (const [route, config] of Object.entries(pages)) {
    const dirPath = path.join(baseDir, route);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const compName = route.charAt(0).toUpperCase() + route.slice(1) + "Page";
    
    const columnsList = config.columns.map(c => `<th className="px-6 py-4 font-semibold">${c}</th>`).join('\n                  ');
    
    const rowRenders = config.columns.map((col, idx) => {
        if (col.includes("Status")) {
            return `<td className="px-6 py-4"><span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${row["${col}"] === "Active" || row["${col}"] === "Completed" || row["${col}"] === "Approved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : row["${col}"] === "Pending" || row["${col}"] === "In Progress" || row["${col}"] === "Maintenance" || row["${col}"] === "Open" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}\`}>{row["${col}"]}</span></td>`;
        } else if (idx === 0) {
            return `<td className="px-6 py-4 font-medium text-white group-hover:text-amber-400 transition-colors">{row["${col}"]}</td>`;
        } else {
            return `<td className="px-6 py-4 text-slate-300">{row["${col}"]}</td>`;
        }
    });
    
    const rowRendersStr = rowRenders.join('\\n                    ');
    
    const content = getTemplate(
        compName,
        config.title,
        config.description,
        columnsList,
        rowRendersStr,
        JSON.stringify(config.data, null, 4),
        config.data.length
    );
    
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
}

console.log("All 10 dummy pages generated successfully.");
