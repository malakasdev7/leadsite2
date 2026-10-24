import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyAdminCredentials,
} from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { email = '', password = '', customHashOverride } = req.body || {};

  if (!email.trim() || !password) {
    return res.status(400).json({
      error: 'Informe seu e-mail administrativo e sua senha.',
    });
  }

  const isValid = await verifyAdminCredentials(email, password, customHashOverride);

  if (!isValid) {
    return res.status(401).json({
      error: 'E-mail ou senha inválidos. Verifique suas credenciais de administrador.',
    });
  }

  const token = await createSessionToken(email.trim().toLowerCase(), 'Gustavo · BlackDev');

  const maxAge = 60 * 60 * 24 * 30;
  const isHttps =
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.headers.referer && req.headers.referer.startsWith('https://'));
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
      isHttps ? '; Secure' : ''
    }`
  );

  return res.status(200).json({
    ok: true,
    user: {
      email: email.trim().toLowerCase(),
      name: 'Gustavo · BlackDev',
    },
  });
}
