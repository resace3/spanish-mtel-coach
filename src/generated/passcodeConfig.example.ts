export const passcodeConfig = {
  algorithm: 'PBKDF2-SHA-256',
  iterations: 210000,
  salt: 'example-public-salt',
  hash: 'example-public-hash',
} as const;
