import { createHash, timingSafeEqual } from 'node:crypto';

/** sha256 of a secret. Equal-length digests make the comparison constant-time. */
export function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Constant-time check of a presented secret against a precomputed digest. */
export function matchesDigest(
  presented: string | undefined,
  expected: Buffer,
): boolean {
  return !!presented && timingSafeEqual(digest(presented), expected);
}
