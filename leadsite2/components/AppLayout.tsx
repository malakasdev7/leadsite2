import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PLANS, PlanId, PLAN_ORDER } from '../utils/leadsiteConstants';
import { loadQuota, saveQuota, UserQuotaState } from '../utils/leadsiteStore';
import { FaqChatWidget } from './FaqChatWidget';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle, actions }) => {
  const router = useRouter();
  const [quota, setQuota] = useState<UserQuotaState>({
    plan: 'pro',
    leadsUsed: 6,
    sitesUsed: 1,
    scriptsUsed: 4,
    editsUsed: 2,
  });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setQuota(loadQuota());
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setDark(currentTheme === 'dark');

    const handleQuotaUpdate = () => setQuota(loadQuota());
    window.addEventListener('leadsite-quota-updated', handleQuotaUpdate);
    return () => window.removeEventListener('leadsite-quota-updated', handleQuotaUpdate);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleChangePlan = (newPlan: PlanId) => {
    const updated = { ...quota, plan: newPlan };
    setQuota(updated);
    saveQuota(updated);
    window.dispatchEvent(new Event('leadsite-quota-updated'));
  };

  const currentPlanDef = PLANS[quota.plan];

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', badge: null },
    { href: '/leads', label: 'Buscar Leads', badge: 'Maps' },
    { href: '/studio', label: 'Editor de Site IA', badge: 'Studio' },
    { href: '/crm', label: 'CRM & Agendamentos', badge: 'Funil' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[--bg] text-[--text]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[--border-dim] glass-sidebar flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="LeadSite" className="logo-img h-[20px] w-auto" />
            </Link>
            <button
              onClick={toggleTheme}
              className="text-[12px] px-2.5 py-1 rounded-lg border border-[--border] text-[--text-3] hover:text-[--text]"
              title="Alternar tema Claro/Escuro"
            >
              {dark ? '☀️ Claro' : '🌙 Escuro'}
            </button>
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
                  style={active ? { background: '#0071E3' } : undefined}
                >
                  <span>{item.label}</span>
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

        {/* Plan & Quota Box */}
        <div className="mt-6 pt-4 border-t border-[--border-dim] space-y-3">
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                Plano Ativo
              </span>
              <select
                value={quota.plan}
                onChange={e => handleChangePlan(e.target.value as PlanId)}
                className="text-[11.5px] font-bold px-2 py-0.5 rounded-md border border-[--border] bg-[--bg-card] text-[#0071E3]"
              >
                {PLAN_ORDER.map(pid => (
                  <option key={pid} value={pid}>
                    {PLANS[pid].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between text-[--text-3]">
                <span>Leads no mês</span>
                <span className="font-semibold">
                  {quota.leadsUsed} / {currentPlanDef.limits.leadsPerMonth}
                </span>
              </div>
              <div className="flex justify-between text-[--text-3]">
                <span>Sites gerados</span>
                <span className="font-semibold">
                  {quota.sitesUsed} / {currentPlanDef.limits.sitesPerMonth}
                </span>
              </div>
              <div className="flex justify-between text-[--text-3]">
                <span>Scripts de venda</span>
                <span className="font-semibold">
                  {quota.scriptsUsed} / {currentPlanDef.limits.scriptsPerMonth}
                </span>
              </div>
              <div className="flex justify-between text-[--text-3]">
                <span>Edições no chat</span>
                <span className="font-semibold">
                  {quota.editsUsed} / {currentPlanDef.limits.editsPerMonth}
                </span>
              </div>
            </div>

            <Link
              href="/#precos"
              className="mt-3 block w-full text-center text-[12px] font-bold py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: '#0071E3' }}
            >
              Ver limites dos planos
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 max-w-7xl mx-auto w-full">
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--border-dim]">
            <div>
              {title && (
                <h1 className="text-[clamp(1.4rem,2.5vw,2rem)] font-extrabold tracking-tight text-[--text]">
                  {title}
                </h1>
              )}
              {subtitle && <p className="text-[14px] text-[--text-3] mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
          </div>
        )}
        {children}
      </main>

      <FaqChatWidget place="app" />
    </div>
  );
};
