export const SESSION_COOKIE_NAME = 'blackdev_session';

// Default fallback credentials when ADMIN_EMAIL / ADMIN_PASSWORD_HASH are not set in env
export const DEFAULT_ADMIN_EMAIL = 'admin@blackdev.com.br';
// SHA-256 of "blackdev123"
export const DEFAULT_ADMIN_PASSWORD_SHA256 =
  '7c2d0f7e58d2497a334609593263d1249a31e75218a39162078a8858b1f09567';

function getSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'blackdev-leads-internal-secret-key-2026'
  );
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface SessionPayload {
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export async function createSessionToken(email: string, name = 'Administrador BlackDev'): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email,
    name,
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days
  };
  const base64Payload = btoa( encodeURIComponent(JSON.stringify(payload)) );
  const sig = await hmacSha256Hex(base64Payload, getSecret());
  return `${base64Payload}.${sig}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  try {
    const [base64Payload, sig] = token.split('.');
    if (!base64Payload || !sig) return null;
    const expectedSig = await hmacSha256Hex(base64Payload, getSecret());
    if (sig !== expectedSig) return null;
    const jsonStr = decodeURIComponent(atob(base64Payload));
    const payload = JSON.parse(jsonStr) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string,
  customHashOverride?: string
): Promise<boolean> {
  const configuredEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const normalizedInputEmail = (emailInput || '').trim().toLowerCase();

  if (normalizedInputEmail !== configuredEmail) {
    return false;
  }

  const configuredHash = (
    customHashOverride ||
    process.env.ADMIN_PASSWORD_HASH ||
    ''
  ).trim();

  const inputSha256 = await sha256Hex(passwordInput);

  if (!configuredHash) {
    // Default password allowed: "blackdev123" or "admin123"
    return (
      passwordInput === 'blackdev123' ||
      passwordInput === 'admin123' ||
      inputSha256 === DEFAULT_ADMIN_PASSWORD_SHA256
    );
  }

  // Match either SHA-256 hex digest or direct value configured in ADMIN_PASSWORD_HASH
  return (
    configuredHash.toLowerCase() === inputSha256.toLowerCase() ||
    configuredHash === passwordInput
  );
}
