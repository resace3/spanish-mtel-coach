import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', 'playwright-report', 'test-results']);
const ignoredFiles = new Set(['scripts/check-no-secrets.mjs', 'src/generated/passcodeConfig.ts']);
const secretPatterns = [
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9_]{24,}\b/ },
  { name: 'private key', re: /-----BEGIN (?:RSA |OPENSSH |DSA |EC |)PRIVATE KEY-----/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'generic long secret assignment', re: /\b(?:api[_-]?key|token|secret|password)\b\s*[:=]\s*['"][A-Za-z0-9+/=._-]{32,}['"]/i },
];
const unsafePatterns = [
  { name: 'eval call', re: /\beval\s*\(/ },
  { name: 'Function constructor', re: /\bnew\s+Function\s*\(/ },
  { name: 'dangerous HTML rendering', re: /\bdangerouslySetInnerHTML\b/ },
];
const externalResourcePattern = /<(?:script|link|img|iframe|audio|video)\b[^>]+(?:src|href)=["']https?:\/\//i;

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(root, full);
    if (ignoredDirs.has(entry) || ignoredFiles.has(rel)) continue;
    const stats = statSync(full);
    if (stats.isDirectory()) {
      results.push(...walk(full));
    } else if (stats.isFile()) {
      results.push(full);
    }
  }
  return results;
}

const failures = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) {
    if (pattern.re.test(text)) failures.push(`${rel}: possible ${pattern.name}`);
  }
  if (/^(src|index\.html|public)/.test(rel) && !rel.startsWith('src/tests')) {
    for (const pattern of unsafePatterns) {
      if (pattern.re.test(text)) failures.push(`${rel}: unsafe pattern ${pattern.name}`);
    }
    if (externalResourcePattern.test(text)) failures.push(`${rel}: external resource reference`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('No obvious committed secrets or unsafe static patterns found.');
