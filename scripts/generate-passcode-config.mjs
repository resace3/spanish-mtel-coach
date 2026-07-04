import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const passcode = process.env.SITE_PASSCODE;

if (!passcode || passcode.trim().length === 0) {
  console.error('SITE_PASSCODE is required to generate the static passcode config.');
  process.exit(1);
}

const iterations = Number.parseInt(process.env.PASSCODE_ITERATIONS ?? '210000', 10);
const salt = randomBytes(16);
const hash = pbkdf2Sync(passcode, salt, iterations, 32, 'sha256');
const outFile = resolve('src/generated/passcodeConfig.ts');

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  `export const passcodeConfig = {
  algorithm: 'PBKDF2-SHA-256',
  iterations: ${iterations},
  salt: '${salt.toString('base64')}',
  hash: '${hash.toString('base64')}',
} as const;
`,
  { mode: 0o600 },
);

console.log(`Generated ${outFile} with public hash parameters.`);
