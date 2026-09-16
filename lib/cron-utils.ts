import crypto from 'crypto';

export function verifyCronSecret(
  request: Request,
  configuredSecret: string | undefined = process.env.CRON_SECRET,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): { authorized: boolean; reason?: string } {
  // In production, fail closed if no secret is configured
  if (isProduction && !configuredSecret) {
    return {
      authorized: false,
      reason: 'Server configuration error: CRON_SECRET is required in production',
    };
  }

  // If no secret configured in development, allow for testing convenience with warning
  if (!configuredSecret) {
    return { authorized: true };
  }

  // Authentication MUST strictly use Authorization: Bearer <token>
  // Query-string tokens (?secret=) are strictly forbidden to prevent URL logging leaks.
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, reason: 'Missing authorization credentials' };
  }

  const providedToken = authHeader.substring(7).trim();

  if (!providedToken) {
    return { authorized: false, reason: 'Missing authorization credentials' };
  }

  // Constant-time comparison to prevent timing side-channel attacks
  try {
    const a = Buffer.from(providedToken);
    const b = Buffer.from(configuredSecret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { authorized: false, reason: 'Invalid authorization token' };
    }
    return { authorized: true };
  } catch {
    return { authorized: false, reason: 'Invalid authorization token' };
  }
}
