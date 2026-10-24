import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { CRM_STAGE_COLORS, CRM_STAGES } from '../../utils/leadsiteConstants';
import {
  AppointmentItem,
  GeneratedSite,
  LeadItem,
  loadAppointments,
  loadLeads,
  loadSites,
} from '../../utils/leadsiteStore';

const DashboardPage: NextPage = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  useEffect(() => {
    setLeads(loadLeads());
    setSites(loadSites());
    setAppointments(loadAppointments());
  }, []);

  const totalLeads = leads.length;
  const leadsWithoutSite = leads.filter(l => l.flags.includes('Sem site')).length;
  const leadsWithProblematicSite = leads.filter(
    l =>
      !l.flags.includes('Sem site') &&
      (l.flags.includes('Site fora do ar') ||
        l.flags.includes('Site sem SSL') ||
        l.flags.includes('Sem SSL') ||
        l.flags.includes('Site sem contato visível') ||
        l.flags.includes('Sem contato') ||
        l.flags.includes('Site desatualizado'))
  ).length;
  const totalSitesGenerated = sites.length;
  const totalSitesPublished = sites.filter(
    s => (s.status || (s.published ? 'published' : 'draft')) === 'published'
  ).length;
  const crmLeads = leads.filter(l => l.inCrm);
  const scheduledAppointments = appointments.filter(
    a => !a.completed && a.status !== 'cancelado'
  );

  const kpis = [
    {
      label: 'Total de Leads Encontrados',
      value: totalLeads,
      sub: `${crmLeads.length} enviados ao CRM`,
      color: '#3B82F6',
      href: '/leads',
    },
    {
      label: 'Leads Sem Site',
      value: leadsWithoutSite,
      sub: 'Alta conversão p/ criação',
      color: '#EF4444',
      href: '/leads',
    },
    {
      label: 'Leads c/ Site Problemático',
      value: leadsWithProblematicSite,
      sub: 'Fora do ar, sem SSL ou antigo',
      color: '#F59E0B',
      href: '/leads',
    },
    {
      label: 'Sites Gerados',
      value: totalSitesGenerated,
      sub: 'Criados automaticamente c/ IA',
      color: '#8B5CF6',
      href: '/studio',
    },
    {
      label: 'Sites Publicados',
      value: totalSitesPublished,
      sub: 'Links públicos ativos (/site/slug)',
      color: '#10B981',
      href: '/studio',
    },
    {
      label: 'Compromissos Agendados',
      value: scheduledAppointments.length,
      sub: 'Reuniões, ligações e visitas',
      color: '#06B6D4',
      href: '/compromissos',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard — BlackDev Leads</title>
      </Head>

      <AppLayout
        title="Visão Geral · BlackDev Leads"
        subtitle="Acompanhe seus leads locais, diagnóstico de sites, pipeline comercial e compromissos agendados."
        actions={
          <>
            <Link
              href="/leads"
              className="text-[12.5px] font-bold px-4 py-2.5 rounded-xl text-white shadow-sm"
              style={{ background: '#2563EB' }}
            >
              🔍 Buscar Leads no Maps
            </Link>
            <Link
              href="/studio"
              className="text-[12.5px] font-semibold px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB]"
            >
              🎨 Criar / Editar Site
            </Link>
            <Link
              href="/crm"
              className="text-[12.5px] font-semibold px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#10B981]"
            >
              🗂️ Abrir CRM
            </Link>
            <Link
              href="/compromissos"
              className="text-[12.5px] font-semibold px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#8B5CF6]"
            >
              📅 Compromissos
            </Link>
          </>
        }
      >
        {/* 6 Main KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpis.map(kpi => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="glass-card rounded-2xl p-5 border border-[--border] hover:border-[#2563EB] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[--text-4]">
                  {kpi.label}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: kpi.color }}
                />
              </div>
              <div
                className="text-3xl font-extrabold mt-2"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </div>
              <div className="text-[12px] text-[--text-4] mt-1">{kpi.sub}</div>
            </Link>
          ))}
        </div>

        {/* Charts Row: CRM Funnel + Site Diagnostic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* CRM Stages Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15.5px] font-extrabold text-[--text]">
                  Leads no CRM por Etapa do Funil
                </h2>
                <p className="text-[12px] text-[--text-4]">
                  Distribuição dos {crmLeads.length} leads ativos no pipeline comercial
                </p>
              </div>
              <Link href="/crm" className="text-[12px] font-bold text-[#2563EB] hover:underline">
                Gerenciar Funil →
              </Link>
            </div>

            <div className="space-y-3">
              {CRM_STAGES.map(stage => {
                const stageLeads = crmLeads.filter(l => l.stage === stage);
                const count = stageLeads.length;
                const totalValue = stageLeads.reduce(
                  (acc, item) => acc + (item.estimatedValue || 1500),
                  0
                );
                const pct =
                  crmLeads.length > 0 ? Math.round((count / crmLeads.length) * 100) : 0;

                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1">
                      <span className="font-bold flex items-center gap-2 text-[--text]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: CRM_STAGE_COLORS[stage] }}
                        />
                        {stage}
                      </span>
                      <span className="text-[--text-3] text-[12px]">
                        <strong>{count}</strong> leads ({pct}%) ·{' '}
                        <span className="text-[--text-4]">
                          R$ {totalValue.toLocaleString('pt-BR')}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[--bg-2] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                          background: CRM_STAGE_COLORS[stage],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Site Diagnostic Chart */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-[15.5px] font-extrabold text-[--text] mb-1">
                Diagnóstico Digital dos Leads
              </h2>
              <p className="text-[12px] text-[--text-4] mb-4">
                Problemas identificados automaticamente nas buscas
              </p>

              <div className="space-y-3">
                {[
                  {
                    label: 'Sem site próprio',
                    count: leadsWithoutSite,
                    color: '#EF4444',
                  },
                  {
                    label: 'Site fora do ar',
                    count: leads.filter(l => l.flags.includes('Site fora do ar')).length,
                    color: '#F59E0B',
                  },
                  {
                    label: 'Site sem SSL (Não seguro)',
                    count: leads.filter(
                      l => l.flags.includes('Site sem SSL') || l.flags.includes('Sem SSL')
                    ).length,
                    color: '#EAB308',
                  },
                  {
                    label: 'Site sem contato visível / antigo',
                    count: leads.filter(
                      l =>
                        l.flags.includes('Site sem contato visível') ||
                        l.flags.includes('Sem contato') ||
                        l.flags.includes('Site desatualizado')
                    ).length,
                    color: '#8B5CF6',
                  },
                  {
                    label: 'Oportunidade quente (Score 80+)',
                    count: leads.filter(l => l.tier === 'quente').length,
                    color: '#10B981',
                  },
                ].map(item => {
                  const pct =
                    totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="font-medium text-[--text-2]">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[--bg-2] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[--border-dim]">
              <Link
                href="/leads"
                className="block w-full text-center py-2.5 rounded-xl text-[12.5px] font-bold text-white"
                style={{ background: '#2563EB' }}
              >
                Nova Varredura no Google Maps →
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Recent Columns: Últimos Leads, Últimos Sites, Últimos Compromissos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos Leads Adicionados */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[--text]">
                Últimos Leads Adicionados
              </h2>
              <Link href="/leads" className="text-[12px] font-bold text-[#2563EB]">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-2.5">
              {leads.slice(0, 5).map(lead => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl border border-[--border-dim] bg-[--bg-card] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[--text] truncate">
                      {lead.name}
                    </div>
                    <div className="text-[11px] text-[--text-4] truncate">
                      {lead.category} · {lead.city}/{lead.state}
                    </div>
                  </div>
                  <Link
                    href={`/crm?leadId=${lead.id}`}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] shrink-0"
                  >
                    Detalhes
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos Sites Gerados */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[--text]">
                Últimos Sites Gerados
              </h2>
              <Link href="/studio" className="text-[12px] font-bold text-[#2563EB]">
                Abrir Studio →
              </Link>
            </div>

            {sites.length === 0 ? (
              <div className="text-center py-8 text-[12.5px] text-[--text-4]">
                Nenhum site gerado ainda. Vá em Buscar Leads e clique em &ldquo;Gerar site&rdquo;.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sites.slice(0, 5).map(site => {
                  const status =
                    site.status || (site.published ? 'published' : 'draft');
                  return (
                    <div
                      key={site.id}
                      className="p-3 rounded-xl border border-[--border-dim] bg-[--bg-card] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[--text] truncate">
                          {site.businessName}
                        </div>
                        <div className="text-[11px] text-[--text-4] flex items-center gap-2">
                          <span>/site/{site.slug}</span>
                          <span
                            className="font-bold"
                            style={{
                              color:
                                status === 'published'
                                  ? '#10B981'
                                  : status === 'archived'
                                  ? '#EF4444'
                                  : '#F59E0B',
                            }}
                          >
                            ●{' '}
                            {status === 'published'
                              ? 'Publicado'
                              : status === 'archived'
                              ? 'Arquivado'
                              : 'Rascunho'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/studio?siteId=${site.id}`}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-[--border] hover:border-[#2563EB]"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/site/${site.slug}`}
                          target="_blank"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white"
                          style={{ background: '#10B981' }}
                        >
                          Ver ↗
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimos Compromissos */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[--text]">
                Próximos Compromissos
              </h2>
              <Link href="/compromissos" className="text-[12px] font-bold text-[#2563EB]">
                Agenda completa →
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-[12.5px] text-[--text-4]">
                Nenhum compromisso agendado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {appointments.slice(0, 5).map(apt => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-[--border-dim] bg-[--bg-card]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-bold text-[--text] truncate">
                        {apt.title || apt.leadName}
                      </span>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#3B82F6] uppercase">
                        {apt.type}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[--text-4] mt-1">
                      📅 {apt.date} às {apt.time} · {apt.leadName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default DashboardPage;
