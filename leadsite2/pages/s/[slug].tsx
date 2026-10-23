import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  buildInitialSiteConfig,
  GeneratedSite,
  INITIAL_LEADS,
  INITIAL_SITES,
  loadSites,
} from '../../utils/leadsiteStore';

const PublicSitePage: NextPage = () => {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [site, setSite] = useState<GeneratedSite | null>(null);

  useEffect(() => {
    const allSites = loadSites();
    const found = allSites.find(s => s.slug === slug);
    if (found) {
      setSite(found);
      return;
    }
    // Fallback if someone visits any slug directly via link
    if (slug) {
      const prettyName = slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const fallbackLead = {
        ...INITIAL_LEADS[0],
        name: prettyName,
      };
      setSite({
        ...INITIAL_SITES[0],
        slug,
        businessName: prettyName,
        versions: [
          {
            versionNumber: 1,
            createdAt: new Date().toISOString(),
            instruction: 'Preview público',
            config: buildInitialSiteConfig(fallbackLead),
          },
        ],
        currentVersionIndex: 0,
      });
    }
  }, [slug]);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--bg] text-[--text]">
        Carregando site publicado...
      </div>
    );
  }

  const ver = site.versions[site.currentVersionIndex] || site.versions[0];
  const cfg = ver.config;
  const waUrl = `https://wa.me/${cfg.phone}?text=${encodeURIComponent(cfg.whatsappMessage)}`;

  return (
    <>
      <Head>
        <title>
          {cfg.heroTitle} — {site.category} em {site.city}/{site.state}
        </title>
      </Head>

      <div
        className="min-h-screen flex flex-col justify-between"
        style={{
          background: cfg.darkMode ? '#0B0F19' : '#FFFFFF',
          color: cfg.darkMode ? '#F9FAFB' : '#111827',
        }}
      >
        {/* Top Bar Preview Notice */}
        <div className="bg-[#001E3C] text-white text-[12px] px-4 py-2 flex items-center justify-between">
          <span>
            🟢 Site demonstrativo gerado via <strong>LeadSite IA</strong> para{' '}
            <strong>{cfg.heroTitle}</strong>
          </span>
          <Link href={`/studio?siteId=${site.id}`} className="underline font-semibold">
            Editar este site no Studio →
          </Link>
        </div>

        {/* Hero Section */}
        <header
          className="px-6 py-20 text-center text-white"
          style={{
            background: `linear-gradient(135deg, ${cfg.primaryColor} 0%, ${cfg.secondaryColor} 100%)`,
          }}
        >
          <div className="max-w-3xl mx-auto">
            <span className="inline-block text-[12px] font-semibold px-3.5 py-1 rounded-full bg-white/15 text-white/95 mb-5">
              {cfg.badgeText}
            </span>
            <h1 className="text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-tight">
              {cfg.heroTitle}
            </h1>
            <p className="mt-4 text-[clamp(1rem,2vw,1.25rem)] text-white/85 max-w-2xl mx-auto leading-relaxed">
              {cfg.heroSubtitle}
            </p>
            <div className="mt-8">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-[16px] font-bold px-8 py-4 rounded-full text-white shadow-xl transition-transform hover:scale-105"
                style={{ background: cfg.accentColor }}
              >
                💬 {cfg.ctaText}
              </a>
            </div>
          </div>
        </header>

        {/* Services */}
        <section className="max-w-5xl mx-auto px-6 py-16 w-full">
          <h2 className="text-[24px] font-extrabold text-center mb-10">
            Nossos Serviços & Especialidades
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cfg.services.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border shadow-sm flex flex-col justify-between"
                style={{
                  borderColor: cfg.darkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  background: cfg.darkMode ? '#111827' : '#F9FAFB',
                }}
              >
                <div>
                  <h3 className="text-[17px] font-bold">{s.title}</h3>
                  <p
                    className="mt-2 text-[14px] leading-relaxed"
                    style={{ color: cfg.darkMode ? '#9CA3AF' : '#4B5563' }}
                  >
                    {s.description}
                  </p>
                </div>
                {s.price && (
                  <div
                    className="mt-4 pt-3 border-t text-[14px] font-extrabold"
                    style={{
                      color: cfg.accentColor,
                      borderColor: cfg.darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                    }}
                  >
                    {s.price}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section
          className="py-16 px-6 border-t"
          style={{
            borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
            background: cfg.darkMode ? '#111827' : '#F8FAFC',
          }}
        >
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[22px] font-extrabold text-center mb-8">
              Avaliações de Clientes Reais
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {cfg.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border"
                  style={{
                    background: cfg.darkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                  }}
                >
                  <div className="text-[#FF9F0A] text-[15px] mb-2">★★★★★</div>
                  <p className="text-[14px] leading-relaxed italic">“{t.text}”</p>
                  <div className="mt-4 text-[13px] font-bold">{t.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="px-6 py-12 border-t text-center"
          style={{ borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
        >
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="text-[18px] font-bold">{cfg.aboutTitle}</h3>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: cfg.darkMode ? '#9CA3AF' : '#4B5563' }}
            >
              {cfg.aboutText}
            </p>
            <div className="pt-3 text-[13.5px] font-semibold">📍 {cfg.address}</div>
            <div className="text-[13px]">🕒 {cfg.openingHours}</div>
            <div className="text-[13px]">📞 +{cfg.phone}</div>
            {!site.removeBadge && (
              <div className="pt-6 text-[11.5px] opacity-60">
                Criado com <strong>LeadSite</strong> · Hospedagem rápida inclusa
              </div>
            )}
          </div>
        </footer>

        {/* Floating WhatsApp CTA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-bold text-[14px] shadow-2xl transition-transform hover:scale-105"
          style={{ background: '#1FA855' }}
        >
          💬 Falar no WhatsApp
        </a>
      </div>
    </>
  );
};

export default PublicSitePage;
