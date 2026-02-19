import { ConsentDuration } from '../types';

export function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  const normalized = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${normalized}${normalized}${normalized}${normalized}`;
}

export function createTransactionId(seed: string): string {
  return simpleHash(`${seed}-${Date.now()}`);
}

export function getConsentExpiry(createdAt: string, duration: ConsentDuration): string | undefined {
  const base = new Date(createdAt).getTime();
  if (duration === 'PERMANENT') return undefined;
  const delta = duration === '24H' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return new Date(base + delta).toISOString();
}

export function isExpired(expiry?: string): boolean {
  if (!expiry) return false;
  return new Date(expiry).getTime() < Date.now();
}
