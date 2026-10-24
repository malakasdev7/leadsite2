import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BlackDevSettings,
  INITIAL_SETTINGS,
  LeadItem,
  loadLeads,
  loadSettings,
} from '../utils/leadsiteStore';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface ToastPayload {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ToastPayload>('blackdev-toast', {
        detail: { message, type },
      })
    );
  }
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle, actions }) => {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [settings, setSettings] = useState<BlackDevSettings>(INITIAL_SETTINGS);
  const [globalQuery, setGlobalQuery] = useState('');
  const [quickResults, setQuickResults] = useState<LeadItem[]>([]);
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (!currentTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      setDark(true);
    } else {
      setDark(currentTheme === 'dark');
    }

    const handleToast = (e: Event) => {
      const custom = e as CustomEvent<ToastPayload>;
      if (custom.detail?.message) {
        setToast(custom.detail);
        setTimeout(() => setToast(null), 3500);
      }
    };

    const handleSettingsUpdated = () => setSettings(loadSettings());

    window.addEventListener('blackdev-toast', handleToast);
    window.addEventListener('blackdev-settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('blackdev-toast', handleToast);
      window.removeEventListener('blackdev-settings-updated', handleSettingsUpdated);
    };
  }, []);

  useEffect(() => {
    if (!globalQuery.trim()) {
      setQuickResults([]);
      return;
    }
    const q = globalQuery.trim().toLowerCase();
    const all = loadLeads();
    setQuickResults(
      all
        .filter(
          l =>
            l.name.toLowerCase().includes(q) ||
            l.category.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q) ||
            (l.phone || '').includes(q)
        )
        .slice(0, 5)
    );
  }, [globalQuery]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { href: '/leads', label: 'Buscar Leads', icon: '🔍', badge: 'Maps' },
    { href: '/studio', label: 'Editor de Sites', icon: '🎨', badge: 'IA' },
    { href: '/crm', label: 'CRM Comercial', icon: '🗂️', badge: 'Funil' },
    { href: '/compromissos', label: 'Compromissos', icon: '📅', badge: 'Agenda' },
    { href: '/settings', label: 'Configurações', icon: '⚙️', badge: null },
  ];

  const initials = (settings.adminName || 'BD')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[--bg] text-[--text]">
      {/* Fixed Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[--border-dim] glass-sidebar flex flex-col justify-between p-4 md:sticky md:top-0 md:h-screen">
        <div>
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-[12.5px] tracking-tighter shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${settings.brandPrimaryColor || '#2563EB'} 0%, #1E40AF 100%)`,
                }}
              >
                BD
              </div>
              <div>
                <span className="text-[15.5px] font-extrabold tracking-tight text-[--text] block leading-none">
                  {settings.brandName || 'BlackDev Leads'}
                </span>
                <span className="text-[10px] font-semibold text-[--text-4] uppercase tracking-wider">
                  Painel Interno
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {navItems.map(item => {
              const active =
                router.pathname === item.href || router.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-[--text-3] hover:text-[--text] hover:bg-[--bg-2]'
                  }`}
                  style={
                    active
                      ? { background: settings.brandPrimaryColor || '#2563EB' }
                      : undefined
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-[--bg-2] text-[--text-4]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Box */}
        <div className="mt-6 pt-4 border-t border-[--border-dim] space-y-2.5">
          <div className="glass-card rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                style={{ background: settings.brandPrimaryColor || '#2563EB' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-bold text-[--text] truncate">
                  {settings.adminName}
                </div>
                <div className="text-[10.5px] text-[--text-4] truncate">
                  {settings.adminEmail}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair do painel"
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[--border] text-[--text-3] hover:text-red-500 hover:border-red-500/40 shrink-0"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar with Global Search & Admin Avatar */}
        <header className="sticky top-0 z-30 border-b border-[--border-dim] bg-[--bg]/90 backdrop-blur-md px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={globalQuery}
              onChange={e => setGlobalQuery(e.target.value)}
              placeholder="🔎 Busca global de leads, empresas, cidades ou telefones..."
              className="w-full px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px]"
            />
            {quickResults.length > 0 && (
              <div className="absolute left-0 right-0 top-11 glass-card rounded-2xl p-2 shadow-2xl border border-[--border] z-50 divide-y divide-[--border-dim]">
                {quickResults.map(lead => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => {
                      setGlobalQuery('');
                      router.push(`/crm?leadId=${lead.id}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[--bg-2] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[--text]">{lead.name}</div>
                      <div className="text-[11px] text-[--text-4]">
                        {lead.category} · {lead.city}/{lead.state}
                      </div>
                    </div>
                    <span className="text-[10.5px] font-bold text-[#2563EB]">
                      {lead.stage} →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-[--border] bg-[--bg-card] text-[--text-3] hover:text-[--text]"
            >
              {dark ? '☀️ Tema Claro' : '🌙 Tema Escuro'}
            </button>

            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB]"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: settings.brandPrimaryColor || '#2563EB' }}
              >
                {initials}
              </div>
              <span className="text-[12px] font-semibold text-[--text]">
                {settings.adminName.split(' ')[0]}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--border-dim]">
              <div>
                {title && (
                  <h1 className="text-[clamp(1.35rem,2.3vw,1.85rem)] font-extrabold tracking-tight text-[--text]">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-[13.5px] text-[--text-3] mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all"
          style={{
            background:
              toast.type === 'error'
                ? '#7F1D1D'
                : toast.type === 'info'
                ? '#1E3A8A'
                : '#065F46',
            borderColor: 'rgba(255,255,255,0.18)',
            color: '#FFFFFF',
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
