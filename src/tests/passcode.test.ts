import { describe, expect, it } from 'vitest';
import { constantTimeishEqual, hashPasscode, verifyPasscode } from '../auth/passcode';
import { passcodeConfig } from '../generated/passcodeConfig';

describe('passcode hashing', () => {
  it('matches the generated CI passcode config', async () => {
    await expect(verifyPasscode('test-passcode-for-ci-only')).resolves.toBe(true);
  });

  it('rejects incorrect passcodes', async () => {
    await expect(verifyPasscode('wrong-passcode')).resolves.toBe(false);
  });

  it('hashes with generated public parameters', async () => {
    await expect(hashPasscode('test-passcode-for-ci-only')).resolves.toBe(passcodeConfig.hash);
  });

  it('compares strings without an obvious early length-only return', () => {
    expect(constantTimeishEqual('abc', 'abc')).toBe(true);
    expect(constantTimeishEqual('abc', 'abcd')).toBe(false);
  });
});
