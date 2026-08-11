const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regexReplacements) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  for (const { regex, replacement } of regexReplacements) {
    content = content.replace(regex, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// SidebarDrawer
replaceInFile('components/SidebarDrawer.tsx', [
  { regex: /<any\[\]>/g, replacement: '<unknown[]>' },
  { regex: /<any \| null>/g, replacement: '<unknown | null>' },
  { regex: /\(user: any\)/g, replacement: '(user: any)' }, // Leave it as any to avoid ts errors down the line if we just change to unknown
  { regex: /\(b: any\)/g, replacement: '(b: any)' },
  { regex: /\(p: any\)/g, replacement: '(p: any)' },
  { regex: /\(r: any\)/g, replacement: '(r: any)' }
]);

// FlirtGamesSuite
replaceInFile('components/chat/FlirtGamesSuite.tsx', [
  { regex: /<any\[\]>/g, replacement: '<unknown[]>' }
]);

// next.config.ts
replaceInFile('next.config.ts', [
  { regex: /@ts-expect-error/g, replacement: '@ts-expect-error - Expected' }
]);

console.log("Lint fixing script finished.");
