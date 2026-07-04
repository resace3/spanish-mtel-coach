import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (full.includes('src/tests') || full.includes('src/generated/passcodeConfig.ts')) return [];
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

describe('unsafe HTML/script rejection', () => {
  it('does not use unsafe rendering or dynamic code execution in source', () => {
    const source = files(join(process.cwd(), 'src'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/\bdangerouslySetInnerHTML\b/);
    expect(source).not.toMatch(/\beval\s*\(/);
    expect(source).not.toMatch(/\bnew\s+Function\s*\(/);
  });
});
