import os
import glob

def convert_to_light_theme(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Layout & General Backgrounds
    content = content.replace('bg-zinc-950', 'bg-slate-50')
    content = content.replace('bg-slate-950', 'bg-slate-50')
    content = content.replace('text-zinc-100', 'text-slate-900')
    content = content.replace('text-slate-100', 'text-slate-900')
    
    # Text colors
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('text-slate-300', 'text-slate-700')
    content = content.replace('text-slate-400', 'text-slate-500')
    content = content.replace('text-zinc-400', 'text-slate-500')
    content = content.replace('text-slate-500', 'text-slate-500') # keep same
    content = content.replace('text-slate-600', 'text-slate-400') # keep same
    
    # Backgrounds & Borders (Glassmorphism)
    content = content.replace('bg-white/5', 'bg-white/80')
    content = content.replace('border-white/10', 'border-slate-200')
    content = content.replace('border-white/5', 'border-slate-100')
    content = content.replace('bg-white/[0.02]', 'bg-slate-50/50')
    content = content.replace('bg-black/20', 'bg-slate-100')
    content = content.replace('bg-black/10', 'bg-slate-50')
    content = content.replace('bg-black/40', 'bg-white/90')
    
    # Hovers
    content = content.replace('hover:bg-white/10', 'hover:bg-slate-100')
    content = content.replace('hover:text-white', 'hover:text-slate-900')
    content = content.replace('hover:bg-white/5', 'hover:bg-slate-50')
    
    # Dashboard page specific
    content = content.replace('bg-zinc-900', 'bg-white')
    content = content.replace('border-zinc-800', 'border-slate-200')
    content = content.replace('text-zinc-500', 'text-slate-400')
    content = content.replace('bg-zinc-800', 'bg-slate-100')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    base_dir = "src/app"
    files = glob.glob(os.path.join(base_dir, "**", "*.tsx"), recursive=True)
    
    for file in files:
        print(f"Converting {file}...")
        convert_to_light_theme(file)
        
    print("Theme conversion complete!")

if __name__ == "__main__":
    main()
