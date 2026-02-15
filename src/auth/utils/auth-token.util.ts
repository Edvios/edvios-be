import * as crypto from 'crypto';

/**
 * Generates a random verification token and an expiry date (24 hours from now).
 * @returns An object containing the token and its expiry date.
 */
export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  return {
    token,
    expires,
  };
}
