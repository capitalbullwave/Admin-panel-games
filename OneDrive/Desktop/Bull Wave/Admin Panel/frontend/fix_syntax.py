import os
import re
from pathlib import Path

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "            /\n              value={searchQuery}" in content:
        print(f"Fixing {filepath}")
        content = content.replace("            /\n              value={searchQuery}\n              onChange={(e) => setSearchQuery(e.target.value)}\n            >", "              value={searchQuery}\n              onChange={(e) => setSearchQuery(e.target.value)}\n            />")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

if __name__ == "__main__":
    src_dir = Path(r"c:\Users\rohit\OneDrive\Desktop\Bull Wave\Admin Panel\frontend\src\app")
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                if fix_file(os.path.join(root, file)):
                    count += 1
    
    print(f"Fixed {count} files.")
