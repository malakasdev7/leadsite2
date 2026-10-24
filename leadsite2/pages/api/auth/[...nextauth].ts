import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DEFAULT_ADMIN_EMAIL, verifyAdminCredentials } from '../../../utils/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'BlackDev Admin',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const ok = await verifyAdminCredentials(credentials.email, credentials.password);
        if (!ok) return null;
        return {
          id: 'blackdev-admin',
          email: credentials.email.trim().toLowerCase() || DEFAULT_ADMIN_EMAIL,
          name: 'Gustavo · BlackDev',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'blackdev-leads-internal-secret-key-2026',
};

export default NextAuth(authOptions);
