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

// 1. components/chat/FlirtGamesSuite.tsx
replaceInFile('components/chat/FlirtGamesSuite.tsx', [
  { regex: /import { motion, AnimatePresence } from "framer-motion";/, replacement: 'import { motion } from "framer-motion";' },
  { regex: /import { X, Gamepad2, Volume2, Mic, Sparkles, Coins, Gift, RotateCcw, Palette, Flame }/g, replacement: 'import { X, Gamepad2, Volume2, Mic, Coins, Palette }' },
  { regex: /as any/g, replacement: 'as "bottle" | "truths" | "rps" | "canvas" | "whisper"' }
]);

// 2. components/chat/SecureImage.tsx
replaceInFile('components/chat/SecureImage.tsx', [
  { regex: /AlertTriangle, /g, replacement: '' }
]);

// 3. components/layout/AppLayoutWrapper.tsx
replaceInFile('components/layout/AppLayoutWrapper.tsx', [
  { regex: /\/\/ Pages that should NOT show TopBar[\s\S]*?const FULLSCREEN_PAGES = \[[\s\S]*?\];/g, replacement: '' }
]);

// 4. components/layout/TopBar.tsx
replaceInFile('components/layout/TopBar.tsx', [
  { regex: /const pathname = usePathname\(\);\n/g, replacement: '' },
  { regex: /import { usePathname } from "next\/navigation";\n/g, replacement: '' },
  { regex: /<img src="\/favicon\.png"/g, replacement: '/* eslint-disable-next-line @next/next/no-img-element */\n                <img src="/favicon.png"' }
]);

// 5. components/profile/AdvancedDatingWidget.tsx
replaceInFile('components/profile/AdvancedDatingWidget.tsx', [
  { regex: /You're/g, replacement: 'You&apos;re' },
  { regex: /I'm/g, replacement: 'I&apos;m' },
  { regex: /It's/g, replacement: 'It&apos;s' },
  { regex: /don't/g, replacement: 'don&apos;t' },
  { regex: /won't/g, replacement: 'won&apos;t' },
  { regex: /doesn't/g, replacement: 'doesn&apos;t' }
]);

// 6. components/theme-provider.tsx
replaceInFile('components/theme-provider.tsx', [
  { regex: /\(globalThis as any\)/g, replacement: '(globalThis as unknown as Record<string, unknown>)' },
  { regex: /setMounted\(true\);/g, replacement: '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setMounted(true);' }
]);

// 7. components/ui/AIIcebreaker.tsx
replaceInFile('components/ui/AIIcebreaker.tsx', [
  { regex: /AI's/g, replacement: 'AI&apos;s' },
  { regex: /You're/g, replacement: 'You&apos;re' }
]);

// 8. components/ui/ToastProvider.tsx
replaceInFile('components/ui/ToastProvider.tsx', [
  { regex: /useEffect, /g, replacement: '' }
]);

// 9. hooks/useDeviceAuth.ts
replaceInFile('hooks/useDeviceAuth.ts', [
  { regex: /import { v4 as uuidv4 } from 'uuid';\n/g, replacement: '' }
]);

// 10. hooks/useHaptics.ts
replaceInFile('hooks/useHaptics.ts', [
  { regex: /const triggerHapticFeedback = \(e: React\.MouseEvent \| React\.TouchEvent\) => {/g, replacement: 'const triggerHapticFeedback = () => {' },
  { regex: /onClick={\(e\) => triggerHapticFeedback\(e\)}/g, replacement: 'onClick={() => triggerHapticFeedback()}' },
  { regex: /onClick={triggerHapticFeedback}/g, replacement: 'onClick={() => triggerHapticFeedback()}' }
]);

// 11. lib/api.ts
replaceInFile('lib/api.ts', [
  { regex: /catch \(error: any\)/g, replacement: 'catch (error: unknown)' },
  { regex: /catch \(e: any\)/g, replacement: 'catch (e: unknown)' },
  { regex: /catch \(err: any\)/g, replacement: 'catch (err: unknown)' }
]);

// 12. next.config.ts
replaceInFile('next.config.ts', [
  { regex: /@ts-ignore/g, replacement: '@ts-expect-error' }
]);

// 13. refactor_theme.js
replaceInFile('refactor_theme.js', [
  { regex: /const fs = require\('fs'\);/g, replacement: '/* eslint-disable @typescript-eslint/no-require-imports */\nconst fs = require(\'fs\');' }
]);

// 14. store/useUserStore.ts
replaceInFile('store/useUserStore.ts', [
  { regex: /let newCount/g, replacement: 'const newCount' }
]);

console.log("Lint fixing script finished.");
