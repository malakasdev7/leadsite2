import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { CRM_STAGE_COLORS, CRM_STAGES, LEAD_TIER_STYLES, PLANS } from '../../utils/leadsiteConstants';
import {
  AppointmentItem,
  GeneratedSite,
  LeadItem,
  loadAppointments,
  loadLeads,
  loadQuota,
  loadSites,
  UserQuotaState,
} from '../../utils/leadsiteStore';

const Dashboard: NextPage = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [quota, setQuota] = useState<UserQuotaState>({
    plan: 'pro',
    leadsUsed: 6,
    sitesUsed: 1,
    scriptsUsed: 4,
    editsUsed: 2,
  });

  useEffect(() => {
    setLeads(loadLeads());
    setSites(loadSites());
    setAppointments(loadAppointments());
    setQuota(loadQuota());
  }, []);

  const planDef = PLANS[quota.plan];
  const crmLeads = leads.filter(l => l.inCrm);
  const convertedCount = crmLeads.filter(l => l.stage === 'Convertido').length;

  return (
    <>
      <Head>
        <title>Dashboard — LeadSite</title>
      </Head>

      <AppLayout
        title="Visão Geral do Painel"
        subtitle="Acompanhe seus leads sem site, sites gerados com IA, funil de vendas no CRM e próximos agendamentos."
        actions={
          <>
            <Link
              href="/leads"
              className="text-[12.5px] font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#0071E3' }}
            >
              🔍 Buscar Novos Leads
            </Link>
            <Link
              href="/studio"
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
            >
              🎨 Abrir Editor IA
            </Link>
          </>
        }
      >
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
              Leads Encontrados
            </div>
            <div className="text-[28px] font-extrabold text-[--text] mt-1">{leads.length}</div>
            <div className="text-[11.5px] text-[--text-3] mt-1">
              Cota: {quota.leadsUsed} / {planDef.limits.leadsPerMonth} no mês
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
              Sites Publicados c/ IA
            </div>
            <div className="text-[28px] font-extrabold text-[#0071E3] mt-1">{sites.length}</div>
            <div className="text-[11.5px] text-[--text-3] mt-1">
              Cota: {quota.sitesUsed} / {planDef.limits.sitesPerMonth} no mês
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
              Leads no Funil CRM
            </div>
            <div className="text-[28px] font-extrabold text-[--text] mt-1">{crmLeads.length}</div>
            <div className="text-[11.5px] text-[#1A7E3A] font-semibold mt-1">
              {convertedCount} venda(s) convertida(s)
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
              Reuniões Agendadas
            </div>
            <div className="text-[28px] font-extrabold text-[#1FA855] mt-1">
              {appointments.filter(a => !a.completed).length}
            </div>
            <div className="text-[11.5px] text-[--text-3] mt-1">
              Próxima: {appointments[0]?.date || 'Nenhuma'}
            </div>
          </div>
        </div>

        {/* CRM Funnel Bar */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[--text]">Andamento do Funil de Vendas</h2>
            <Link href="/crm" className="text-[12px] font-bold text-[#0071E3] hover:underline">
              Abrir Kanban completo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CRM_STAGES.map(st => {
              const count = crmLeads.filter(l => l.stage === st).length;
              return (
                <Link
                  key={st}
                  href="/crm"
                  className="p-3.5 rounded-xl border border-[--border-dim] bg-[--bg-2] hover:border-[#0071E3] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[--text-2]">{st}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: CRM_STAGE_COLORS[st] }}
                    />
                  </div>
                  <div className="text-[22px] font-extrabold text-[--text] mt-1">{count}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Two Columns: Recent Leads & Published Sites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Quentes */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[--text]">🔥 Leads Mais Quentes Sem Site</h2>
              <Link href="/leads" className="text-[12px] font-bold text-[#0071E3] hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-2.5">
              {leads.slice(0, 4).map(lead => {
                const tStyle = LEAD_TIER_STYLES[lead.tier];
                return (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl border border-[--border-dim] bg-[--bg-card] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-bold text-[--text] truncate">
                        {lead.name}
                      </div>
                      <div className="text-[11.5px] text-[--text-4]">
                        {lead.category} · {lead.city}/{lead.state} ·{' '}
                        <span className="text-[#D92D20] font-semibold">
                          {lead.flags.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: tStyle.color, background: tStyle.bg }}
                      >
                        {lead.score} pts
                      </span>
                      <Link
                        href={`/crm?leadId=${lead.id}`}
                        className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: '#0071E3' }}
                      >
                        Abordar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sites Gerados */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[--text]">🌐 Sites Gerados & Publicados</h2>
              <Link href="/studio" className="text-[12px] font-bold text-[#0071E3] hover:underline">
                Abrir Editor →
              </Link>
            </div>
            <div className="space-y-3">
              {sites.map(site => (
                <div
                  key={site.id}
                  className="p-4 rounded-xl border border-[--border-dim] bg-[--bg-card] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[--text] truncate">
                        {site.businessName}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: site.published ? '#1FA855' : '#8E8E93' }}
                      >
                        {site.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[--text-4] mt-0.5">
                      {site.category} · {site.versions.length} versão(ões) salva(s) · /s/{site.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/studio?siteId=${site.id}`}
                      className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg border border-[--border] hover:border-[#0071E3]"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/s/${site.slug}`}
                      target="_blank"
                      className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: '#0071E3' }}
                    >
                      Ver Site ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default Dashboard;
