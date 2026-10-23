import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { STUDY_NICHE_STATS, STUDY_STATE_STATS } from '../../utils/leadsiteConstants';

export default function DadosPage() {
  return (
    <>
      <Head>
        <title>Raio-X: Negócios Sem Site no Brasil (2026) — LeadSite</title>
        <meta
          name="description"
          content="Análise de 557.168 negócios locais no Brasil mostra que 35% não têm site próprio. Veja o ranking completo por nicho e estado."
        />
      </Head>

      <div
        className="min-h-screen font-sans antialiased"
        style={{ background: '#0B0F1A', color: '#F1F5F9' }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-xl"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(11,15,26,0.85)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo-mark.svg" alt="LeadSite" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-extrabold tracking-tight">
                Lead<span style={{ color: '#22C55E' }}>Site</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#94A3B8' }}
              >
                Voltar ao Início
              </Link>
              <Link
                href="/leads"
                className="text-xs font-semibold px-4 py-2 rounded-lg text-white"
                style={{ background: '#16A34A' }}
              >
                Buscar Empresas Sem Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
          {/* Hero */}
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#22C55E',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              Estudo LeadSite · Dados Reais 2026
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Raio-X: <span style={{ color: '#22C55E' }}>35% dos negócios locais</span> do Brasil
              não têm site próprio (2026)
            </h1>
            <p className="text-base sm:text-lg max-w-3xl" style={{ color: '#94A3B8' }}>
              Uma análise proprietária de{' '}
              <strong style={{ color: '#F1F5F9' }}>557.168 estabelecimentos ativos</strong> no
              Google Maps em 50 categorias e nas 27 unidades federativas revelou onde estão as
              maiores oportunidades para web designers, freelancers e agências digitais.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Negócios analisados', value: '557.168', color: '#F1F5F9' },
              { label: 'Sem site próprio', value: '193.337 (35%)', color: '#EF4444' },
              { label: 'Categorias mapeadas', value: '55 nichos', color: '#22C55E' },
              { label: 'Municípios cobertos', value: '1.158 cidades', color: '#38BDF8' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-5 rounded-2xl border"
                style={{
                  background: '#111827',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>
                  {kpi.label}
                </div>
                <div className="text-xl sm:text-2xl font-extrabold" style={{ color: kpi.color }}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Niche Table */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: '#111827',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-base font-bold">Ranking por Nicho de Negócio</h2>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                  Proporção de empresas ativas no Google Maps que não possuem site
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {STUDY_NICHE_STATS.map((row) => {
                  const withoutSite = Math.round((row.analyzed * row.noSitePct) / 100);
                  return (
                    <div
                      key={row.niche}
                      className="px-6 py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-semibold" style={{ color: '#F1F5F9' }}>
                          {row.niche}
                        </div>
                        <div style={{ color: '#64748B' }}>
                          {row.analyzed.toLocaleString('pt-BR')} analisados ·{' '}
                          {withoutSite.toLocaleString('pt-BR')} sem site
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-36 justify-end">
                        <div
                          className="w-20 h-2 rounded-full overflow-hidden"
                          style={{ background: '#1E293B' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.noSitePct}%`,
                              background: row.noSitePct >= 45 ? '#EF4444' : '#22C55E',
                            }}
                          />
                        </div>
                        <span
                          className="font-bold w-10 text-right"
                          style={{
                            color: row.noSitePct >= 45 ? '#EF4444' : '#22C55E',
                          }}
                        >
                          {row.noSitePct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* State Table */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: '#111827',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-base font-bold">Ranking por Estado (UF)</h2>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                  Estados brasileiros com maior volume e percentual de empresas sem site
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {STUDY_STATE_STATS.map((row) => {
                  const withoutSite = Math.round((row.analyzed * row.noSitePct) / 100);
                  return (
                    <div
                      key={row.state}
                      className="px-6 py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-semibold" style={{ color: '#F1F5F9' }}>
                          Estado: {row.state}
                        </div>
                        <div style={{ color: '#64748B' }}>
                          {row.analyzed.toLocaleString('pt-BR')} analisados ·{' '}
                          {withoutSite.toLocaleString('pt-BR')} sem site
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-36 justify-end">
                        <div
                          className="w-20 h-2 rounded-full overflow-hidden"
                          style={{ background: '#1E293B' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.noSitePct}%`,
                              background: row.noSitePct >= 40 ? '#F59E0B' : '#22C55E',
                            }}
                          />
                        </div>
                        <span className="font-bold w-10 text-right" style={{ color: '#22C55E' }}>
                          {row.noSitePct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div
            className="p-8 rounded-2xl border text-center space-y-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(22,163,74,0.14) 0%, rgba(17,24,39,0.95) 100%)',
              borderColor: 'rgba(34,197,94,0.3)',
            }}
          >
            <h3 className="text-2xl font-extrabold">
              Encontre esses negócios na sua cidade agora mesmo
            </h3>
            <p className="text-sm max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
              Filtre por nicho, estado, cidade e bairro, gere uma proposta visual com IA em 30
              segundos e aborde pelo WhatsApp com o site já pronto.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#16A34A' }}
              >
                Abrir Buscador de Leads no Google Maps →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
