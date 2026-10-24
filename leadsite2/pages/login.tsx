import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { DEFAULT_ADMIN_EMAIL } from '../utils/auth';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState('blackdev123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const customHashOverride =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('blackdev_admin_pwd_hash_v1') || undefined
          : undefined;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, customHashOverride }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Falha ao autenticar.');
        setLoading(false);
        return;
      }

      const nextPath =
        typeof router.query.from === 'string' && router.query.from.startsWith('/')
          ? router.query.from
          : '/dashboard';
      router.push(nextPath);
    } catch {
      setError('Erro de conexão ao realizar login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login Administrativo — BlackDev Leads</title>
      </Head>

      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(0,113,227,0.16) 0%, #090D16 55%, #05070C 100%)',
          color: '#F8FAFC',
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 border shadow-2xl"
          style={{
            background: 'rgba(17, 24, 39, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg tracking-tight mb-3 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0071E3 0%, #1D4ED8 100%)',
              }}
            >
              BD
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              BlackDev <span style={{ color: '#38BDF8' }}>Leads</span>
            </h1>
            <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
              Acesso exclusivo administrativo · Prospecção & Criação de Sites IA
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: '#94A3B8' }}
              >
                E-mail do Administrador
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@blackdev.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors"
                style={{
                  background: '#0B0F1A',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#F8FAFC',
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: '#94A3B8' }}
                >
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-[11px] font-medium hover:underline"
                  style={{ color: '#38BDF8' }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors"
                style={{
                  background: '#0B0F1A',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#F8FAFC',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-95 disabled:opacity-50 shadow-lg mt-2"
              style={{
                background: 'linear-gradient(135deg, #0071E3 0%, #2563EB 100%)',
              }}
            >
              {loading ? 'Autenticando...' : 'Entrar no Painel BlackDev →'}
            </button>
          </form>

          <div
            className="mt-6 pt-4 border-t text-center text-[11.5px]"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.07)',
              color: '#64748B',
            }}
          >
            Sistema interno de uso próprio · Sem limites de uso
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
