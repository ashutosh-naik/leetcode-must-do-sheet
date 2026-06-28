const fs = require('fs');
const path = require('path');

const files = ['index.mjs', 'index.js'];
const root = path.resolve(__dirname, '..', 'node_modules', 'next-themes', 'dist');

files.forEach((file) => {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) return;
  let content = fs.readFileSync(fp, 'utf-8');

  // Replace unconditional script rendering with server-only rendering
  // to avoid React 19 warning about <script> in client component trees.
  const pattern =
    /return\s+t\.createElement\(["']script["'],\{\.\.\.w,suppressHydrationWarning:!0,nonce:typeof window=="undefined"\?([^:]+):""/;
  const replacement = `return typeof window=="undefined"?t.createElement("script",{...w,suppressHydrationWarning:!0,nonce:$1`;

  if (!pattern.test(content)) {
    // Try the already-patched pattern — skip if already applied
    if (content.includes('return typeof window=="undefined"?t.createElement("script"')) {
      return; // already patched
    }
    console.warn(`[patch-next-themes] Pattern not found in ${file}, skipping.`);
    return;
  }

  content = content.replace(pattern, replacement);
  fs.writeFileSync(fp, content, 'utf-8');
  console.log(`[patch-next-themes] Patched ${file}`);
});
