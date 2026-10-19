import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

export function isPasswordHash(value: string): boolean {
  const parts = value.split('$');
  return parts.length === 3 &&
    parts[0] === 'scrypt' &&
    /^[a-f0-9]{32}$/i.test(parts[1]) &&
    new RegExp(`^[a-f0-9]{${SCRYPT_KEY_LENGTH * 2}}$`, 'i').test(parts[2]);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, storedValue: string): Promise<boolean> {
  if (!isPasswordHash(storedValue)) {
    const input = Buffer.from(password);
    const stored = Buffer.from(storedValue);
    return input.length === stored.length && timingSafeEqual(input, stored);
  }

  const [, saltHex, expectedHex] = storedValue.split('$');
  const actual = await deriveKey(password, Buffer.from(saltHex, 'hex'));
  const expected = Buffer.from(expectedHex, 'hex');
  return timingSafeEqual(actual, expected);
}
