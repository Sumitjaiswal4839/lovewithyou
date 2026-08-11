/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['./app', './components'];

const simpleReplacements = [
  // Backgrounds
  { regex: /bg-\[\#080512\]/g, replace: 'bg-background' },
  { regex: /bg-\[\#07050e\]/g, replace: 'bg-background' },
  { regex: /bg-\[\#0e0a1f\]/g, replace: 'bg-surface' },
  { regex: /bg-\[\#111B17\]/g, replace: 'bg-surface' },
  { regex: /bg-slate-50/g, replace: 'bg-surface' },
  { regex: /bg-white\/5/g, replace: 'bg-surface-elevated' },
  { regex: /bg-white\/10/g, replace: 'bg-surface-elevated' },
  { regex: /bg-white\/20/g, replace: 'bg-surface-elevated' },
  { regex: /bg-black\/60/g, replace: 'bg-surface-elevated' },
  { regex: /bg-black\/40/g, replace: 'bg-surface-elevated' },
  
  // Gradients
  { regex: /from-rose-500 to-pink-500/g, replace: 'from-primary to-primary-hover' },
  { regex: /from-pink-500 to-rose-500/g, replace: 'from-primary to-primary-hover' },
  { regex: /from-rose-500 via-pink-500 to-rose-500/g, replace: 'from-primary via-primary-hover to-primary' },

  // Primary Greens
  { regex: /bg-rose-500/g, replace: 'bg-primary' },
  { regex: /bg-rose-600/g, replace: 'bg-primary-hover' },
  { regex: /bg-pink-500/g, replace: 'bg-primary' },
  { regex: /bg-primary-500/g, replace: 'bg-primary' },
  { regex: /bg-primary-600/g, replace: 'bg-primary-hover' },
  { regex: /bg-primary-900/g, replace: 'bg-primary-hover' },
  { regex: /bg-primary-400/g, replace: 'bg-primary' },
  { regex: /text-rose-500/g, replace: 'text-primary' },
  { regex: /text-rose-400/g, replace: 'text-primary' },
  { regex: /text-rose-600/g, replace: 'text-primary' },
  { regex: /text-pink-500/g, replace: 'text-primary' },
  { regex: /text-primary-500/g, replace: 'text-primary' },
  { regex: /text-primary-600/g, replace: 'text-primary-hover' },
  { regex: /text-primary-400/g, replace: 'text-primary' },
  { regex: /border-rose-500/g, replace: 'border-primary' },
  { regex: /border-rose-400/g, replace: 'border-primary' },
  { regex: /border-primary-500/g, replace: 'border-primary' },
  { regex: /border-primary-600/g, replace: 'border-primary-hover' },
  
  // Ring Colors
  { regex: /ring-rose-500/g, replace: 'ring-primary' },
  { regex: /ring-rose-400/g, replace: 'ring-primary' },
  { regex: /ring-primary-500/g, replace: 'ring-primary' },
  { regex: /ring-pink-500/g, replace: 'ring-primary' },

  // Shadow Colors
  { regex: /shadow-rose-500/g, replace: 'shadow-primary' },
  { regex: /shadow-rose-400/g, replace: 'shadow-primary' },
  { regex: /shadow-primary-500/g, replace: 'shadow-primary' },
  { regex: /shadow-pink-500/g, replace: 'shadow-primary' },

  { regex: /from-rose-500/g, replace: 'from-primary' },
  { regex: /to-rose-500/g, replace: 'to-primary' },
  { regex: /via-rose-500/g, replace: 'via-primary' },
  { regex: /from-primary-500/g, replace: 'from-primary' },
  { regex: /to-primary-500/g, replace: 'to-primary' },
  { regex: /via-primary-500/g, replace: 'via-primary' },
  { regex: /accent-rose-500/g, replace: 'accent-primary' },
  { regex: /accent-primary-500/g, replace: 'accent-primary' },
  
  // Soft primary
  { regex: /bg-rose-500\/10/g, replace: 'bg-primary-soft' },
  { regex: /bg-rose-500\/20/g, replace: 'bg-primary-soft' },
  { regex: /bg-rose-100/g, replace: 'bg-primary-soft' },
  { regex: /text-rose-300/g, replace: 'text-primary' },
  { regex: /bg-primary-50/g, replace: 'bg-primary-soft' },
  { regex: /bg-primary-100/g, replace: 'bg-primary-soft' },
  
  // Text Colors
  { regex: /text-slate-800/g, replace: 'text-foreground' },
  { regex: /text-gray-900/g, replace: 'text-foreground' },
  { regex: /text-slate-700/g, replace: 'text-secondary' },
  { regex: /text-gray-800/g, replace: 'text-secondary' },
  { regex: /text-slate-500/g, replace: 'text-muted' },
  { regex: /text-gray-500/g, replace: 'text-muted' },
  { regex: /text-slate-400/g, replace: 'text-muted' },
  { regex: /text-gray-400/g, replace: 'text-muted' },
  { regex: /text-gray-300/g, replace: 'text-secondary' },
  { regex: /text-gray-200/g, replace: 'text-foreground' },
  { regex: /text-slate-200/g, replace: 'text-foreground' },
  { regex: /text-white/g, replace: 'text-foreground' },

  // Borders
  { regex: /border-white\/10/g, replace: 'border-border' },
  { regex: /border-white\/5/g, replace: 'border-border' },
  { regex: /border-slate-100/g, replace: 'border-border' },
  { regex: /border-slate-200/g, replace: 'border-border' },
  { regex: /divide-white\/5/g, replace: 'divide-divider' },
  { regex: /divide-white\/10/g, replace: 'divide-divider' },
  { regex: /divide-slate-100/g, replace: 'divide-divider' },

  // Status
  { regex: /bg-amber-500/g, replace: 'bg-warning' },
  { regex: /text-amber-500/g, replace: 'text-warning' },
  { regex: /text-amber-400/g, replace: 'text-warning' },
  { regex: /bg-emerald-500/g, replace: 'bg-success' },
  { regex: /text-emerald-500/g, replace: 'text-success' },
  { regex: /text-emerald-400/g, replace: 'text-success' },
  { regex: /bg-red-500/g, replace: 'bg-error' },
  { regex: /text-red-500/g, replace: 'text-error' },
  
  { regex: /bg-emerald-100/g, replace: 'bg-success\/20' },
  { regex: /text-emerald-600/g, replace: 'text-success' },
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // 1. Simple regex replacements
      for (const { regex, replace } of simpleReplacements) {
        content = content.replace(regex, replace);
      }

      // 2. Fix buttons text color (className parsing)
      // Find all classNames and if it contains bg-primary or bg-primary-hover, change text-foreground to text-white
      const classNameRegex = /className=(["'])(.*?)\1/g;
      content = content.replace(classNameRegex, (match, quote, classList) => {
        if (classList.includes('bg-primary') || classList.includes('bg-primary-hover') || classList.includes('from-primary')) {
          const updatedList = classList.replace(/text-foreground/g, 'text-white').replace(/text-secondary/g, 'text-white\/80').replace(/text-muted/g, 'text-white\/60');
          return `className=${quote}${updatedList}${quote}`;
        }
        return match;
      });
      
      // Also check template literal classNames like className={`...`}
      const templateLiteralRegex = /className=\{`([^`]+)`\}/g;
      content = content.replace(templateLiteralRegex, (match, classList) => {
        if (classList.includes('bg-primary') || classList.includes('bg-primary-hover') || classList.includes('from-primary')) {
          const updatedList = classList.replace(/text-foreground/g, 'text-white').replace(/text-secondary/g, 'text-white\/80').replace(/text-muted/g, 'text-white\/60');
          return `className={\`${updatedList}\`}`;
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

DIRECTORIES.forEach(dir => processDirectory(dir));
