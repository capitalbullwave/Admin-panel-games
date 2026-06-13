import os
import re
from pathlib import Path

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already refactored (e.g. contains statusFilter state)
    if 'const [statusFilter, setStatusFilter] = useState("All");' in content:
        return False

    # Skip if it doesn't contain the static filter button
    static_filter_re = re.compile(
        r'<\s*button[^>]*>\s*<\s*Filter[^>]*>\s*Filter\s*<\s*/button\s*>',
        re.IGNORECASE | re.DOTALL
    )
    if not static_filter_re.search(content):
        return False

    print(f"Modifying {filepath}")

    # 1. Add "use client"; if missing
    if '"use client"' not in content and "'use client'" not in content:
        content = '"use client";\n\n' + content

    # 2. Add imports
    if 'useState' not in content:
        # insert it after other imports or at top
        if 'import { Card' in content:
            content = content.replace('import { Card', 'import { useState } from "react";\nimport { Card', 1)
        else:
            content = 'import { useState } from "react";\n' + content

    if 'DropdownMenu' not in content:
        dropdown_import = """import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";\n"""
        if 'import { Card' in content:
            content = content.replace('import { Card', dropdown_import + 'import { Card', 1)
        else:
            content = dropdown_import + content

    # 3. Inject State variables inside the component
    component_start_re = re.compile(r'(export default function \w+\([^)]*\)\s*\{|const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)')
    match = component_start_re.search(content)
    if not match:
        print(f"Could not find component start in {filepath}")
        return False
    
    state_injection = """
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
"""
    content = content[:match.end()] + state_injection + content[match.end():]

    # 4. Inject filteredData before `return (`
    return_re = re.compile(r'\n(\s*)return\s*\(\s*<div')
    ret_match = return_re.search(content)
    if not ret_match:
        # Try generic return (
        return_re = re.compile(r'\n(\s*)return\s*\(')
        ret_match = return_re.search(content)
        if not ret_match:
            print(f"Could not find return statement in {filepath}")
            return False
    
    indent = ret_match.group(1)
    
    filtering_logic = f"""
{indent}const filteredData = (typeof data !== 'undefined' ? data : []).filter((row: any) => {{
{indent}  const searchStr = Object.values(row).join(" ").toLowerCase();
{indent}  const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
{indent}  let matchesStatus = true;
{indent}  if (statusFilter !== "All" && row["Status"]) {{
{indent}      if (statusFilter === "Active") matchesStatus = ["Active", "Approved", "Completed", "Success"].includes(row["Status"]);
{indent}      else if (statusFilter === "Pending") matchesStatus = ["Pending", "In Progress", "Processing"].includes(row["Status"]);
{indent}      else if (statusFilter === "Blocked") matchesStatus = ["Blocked", "Rejected", "Failed", "Maintenance"].includes(row["Status"]);
{indent}  }}
{indent}  return matchesSearch && matchesStatus;
{indent}}});

"""
    content = content[:ret_match.start()] + filtering_logic + content[ret_match.start():]

    # 5. Remove old filter button
    content = static_filter_re.sub('', content)

    # 6. Inject Dropdown menu into CardHeader
    card_header_re = re.compile(r'(<CardHeader[^>]*>.*?)(</CardHeader>)', re.DOTALL)
    
    dropdown_markup = """
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-medium transition-colors">
                <Filter className="h-4 w-4" />
                {statusFilter === "All" ? "Filter" : statusFilter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5">
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Active")}>Active / Success</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Pending")}>Pending / Processing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Blocked")}>Blocked / Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        """
    
    def inject_dropdown(m):
        return m.group(1) + dropdown_markup + m.group(2)
    
    content = card_header_re.sub(inject_dropdown, content)

    # 7. Add value and onChange to input in CardHeader
    input_re = re.compile(r'(<input[^>]*placeholder="Search[^>]*)(/?>)', re.IGNORECASE)
    def inject_input_props(m):
        if 'value={searchQuery}' in m.group(1): return m.group(0)
        return m.group(1) + '\n              value={searchQuery}\n              onChange={(e) => setSearchQuery(e.target.value)}\n            ' + m.group(2)
    
    content = input_re.sub(inject_input_props, content)

    # 8. Replace data.map with filteredData.map
    content = content.replace('{data.map(', '{filteredData.map(')
    content = content.replace('data.length === 0', 'filteredData.length === 0')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

if __name__ == "__main__":
    src_dir = Path(r"c:\Users\rohit\OneDrive\Desktop\Bull Wave\Admin Panel\frontend\src\app")
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                try:
                    if process_file(os.path.join(root, file)):
                        count += 1
                except Exception as e:
                    print(f"Error in {file}: {e}")
    
    print(f"Successfully processed {count} files.")
