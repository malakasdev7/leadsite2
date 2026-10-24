import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  BlackDevSettings,
  GeneratedSite,
  INITIAL_SETTINGS,
  INITIAL_SITES,
  loadSettings,
  loadSites,
} from '../../utils/leadsiteStore';

const PublicSitePage: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [settings, setSettings] = useState<BlackDevSettings>(INITIAL_SETTINGS);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    const all = loadSites();
    if (typeof slug === 'string') {
      const found =
        all.find(s => s.slug === slug) ||
        INITIAL_SITES.find(s => s.slug === slug) ||
        all[0] ||
        INITIAL_SITES[0];
      setSite(found);
    }
  }, [slug]);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D16] text-white">
        Carregando site...
      </div>
    );
  }

  const pubStatus = site.status || (site.published ? 'published' : 'draft');
  if (pubStatus !== 'published') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090D16] text-white p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-2xl font-extrabold mb-2">
          Este site está temporariamente {pubStatus === 'archived' ? 'arquivado' : 'despublicado'}
        </h1>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          O administrador do BlackDev Leads alterou o status desta página para rascunho ou arquivo.
        </p>
        <Link
          href="/studio"
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
        >
          Voltar ao Editor de Sites →
        </Link>
      </div>
    );
  }

  const cfg = site.versions[site.currentVersionIndex]?.config || site.versions[0].config;
  const sections = cfg.sections || {
    hero: true,
    services: true,
    about: true,
    gallery: true,
    testimonials: true,
    map: true,
    contactForm: true,
  };
  const cleanPhone = (cfg.phone || '').replace(/\D/g, '');
  const waHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    cfg.whatsappMessage || `Olá! Vi o site de ${site.businessName} e gostaria de atendimento.`
  )}`;
  const telHref = `tel:+${cleanPhone}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    `${site.businessName} ${cfg.address}`
  )}&output=embed`;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    const customWa = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Olá! Meu nome é ${contactName} (${contactPhone}). ${contactMsg}`
    )}`;
    window.open(customWa, '_blank');
  };

  return (
    <>
      <Head>
        <title>{cfg.seoTitle || `${cfg.heroTitle} — ${site.category} em ${site.city}/${site.state}`}</title>
        <meta
          name="description"
          content={cfg.seoDescription || cfg.heroSubtitle}
        />
        <meta
          property="og:title"
          content={cfg.seoTitle || `${cfg.heroTitle} — ${site.category} em ${site.city}`}
        />
        <meta
          property="og:description"
          content={cfg.seoDescription || cfg.heroSubtitle}
        />
        {cfg.heroImage && <meta property="og:image" content={cfg.heroImage} />}
        <meta property="og:type" content="website" />
        <link rel="icon" href="/logo-mark.svg" />
      </Head>

      <div
        className={`min-h-screen font-sans antialiased ${
          cfg.darkMode ? 'bg-[#090D16] text-white' : 'bg-white text-slate-900'
        }`}
      >
        {/* Top Agency Navigation */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{
            background: cfg.darkMode ? 'rgba(9,13,22,0.88)' : 'rgba(255,255,255,0.92)',
            borderColor: cfg.darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {cfg.logoUrl ? (
                <img
                  src={cfg.logoUrl}
                  alt={cfg.heroTitle}
                  className="h-9 w-auto rounded-lg object-contain"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                  style={{ background: cfg.accentColor }}
                >
                  {(cfg.logoText || cfg.heroTitle).slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-extrabold text-base sm:text-lg tracking-tight">
                {cfg.logoText || cfg.heroTitle}
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold opacity-80">
              {sections.services && <a href="#servicos">Serviços</a>}
              {sections.about && <a href="#sobre">Sobre Nós</a>}
              {sections.gallery && <a href="#galeria">Fotos</a>}
              {sections.testimonials && <a href="#avaliacoes">Avaliações</a>}
              <a href="#contato">Localização & Contato</a>
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={telHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border"
                style={{
                  borderColor: cfg.darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)',
                }}
              >
                📞 Ligar
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: cfg.accentColor }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        {sections.hero && (
          <section
            className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${cfg.primaryColor} 0%, ${cfg.secondaryColor} 100%)`,
              color: '#FFFFFF',
            }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-sm">
                  {cfg.badgeText}
                </span>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                  {cfg.heroTitle}
                </h1>

                <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
                  {cfg.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="px-7 py-4 rounded-2xl font-extrabold text-sm sm:text-base text-white shadow-2xl transition-transform hover:scale-105"
                    style={{ background: cfg.accentColor }}
                  >
                    💬 {cfg.ctaText}
                  </a>
                  <a
                    href={telHref}
                    className="px-6 py-4 rounded-2xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                  >
                    📞 Ligar Agora
                  </a>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-white/75">
                  <span>📍 {cfg.address}</span>
                  <span>🕒 {cfg.openingHours}</span>
                </div>
              </div>

              {cfg.heroImage && (
                <div className="lg:col-span-5">
                  <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/15">
                    <img
                      src={cfg.heroImage}
                      alt={cfg.heroTitle}
                      className="w-full h-72 sm:h-96 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Services Section */}
        {sections.services && (
          <section id="servicos" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: cfg.accentColor }}
              >
                Especialidades & Destaques
              </span>
              <h2 className="text-2xl sm:text-4xl font-black mt-1">
                Nossos Serviços e Soluções
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cfg.services.map((srv, idx) => (
                <div
                  key={idx}
                  className={`p-7 rounded-3xl border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                    cfg.darkMode
                      ? 'bg-[#111827] border-white/10'
                      : 'bg-slate-50 border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div>
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm mb-4"
                      style={{ background: cfg.accentColor }}
                    >
                      0{idx + 1}
                    </div>
                    <h3 className="text-lg font-extrabold mb-2">{srv.title}</h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        cfg.darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between">
                    {srv.price ? (
                      <span
                        className="text-sm font-black"
                        style={{ color: cfg.accentColor }}
                      >
                        {srv.price}
                      </span>
                    ) : (
                      <span className="text-xs opacity-70">Consulte condições</span>
                    )}
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold hover:underline"
                      style={{ color: cfg.accentColor }}
                    >
                      Solicitar →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {sections.gallery && cfg.galleryImages && cfg.galleryImages.length > 0 && (
          <section
            id="galeria"
            className={`py-16 px-4 sm:px-6 ${
              cfg.darkMode ? 'bg-[#0D1322]' : 'bg-slate-100/70'
            }`}
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest"
                  style={{ color: cfg.accentColor }}
                >
                  Estrutura & Ambiente
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  Conheça Nosso Espaço e Trabalho
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cfg.galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden shadow-lg border border-white/10 h-64"
                  >
                    <img
                      src={imgUrl}
                      alt={`${cfg.heroTitle} foto ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {sections.about && (
          <section id="sobre" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div
              className={`rounded-3xl p-8 sm:p-12 border ${
                cfg.darkMode
                  ? 'bg-[#111827] border-white/10'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: cfg.accentColor }}
              >
                Quem Somos
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 mb-4">
                {cfg.aboutTitle}
              </h2>
              <p
                className={`text-base leading-relaxed mb-6 ${
                  cfg.darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {cfg.aboutText}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-current/10 text-xs">
                <div>
                  <span className="opacity-60 block">Localização</span>
                  <strong>{cfg.address}</strong>
                </div>
                <div>
                  <span className="opacity-60 block">Horário de Atendimento</span>
                  <strong>{cfg.openingHours}</strong>
                </div>
                <div>
                  <span className="opacity-60 block">Atendimento Direto</span>
                  <strong>+{cfg.phone}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {sections.testimonials && (
          <section
            id="avaliacoes"
            className={`py-16 px-4 sm:px-6 ${
              cfg.darkMode ? 'bg-[#0D1322]' : 'bg-slate-100/70'
            }`}
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest"
                  style={{ color: cfg.accentColor }}
                >
                  Prova Social Real
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  O Que Nossos Clientes Dizem no Google
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cfg.testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border ${
                      cfg.darkMode
                        ? 'bg-[#111827] border-white/10'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="text-amber-400 text-sm mb-2">
                      {'★'.repeat(t.stars || 5)}
                    </div>
                    <p
                      className={`text-sm italic mb-4 ${
                        cfg.darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="text-xs font-extrabold">— {t.author}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact & Google Maps Section */}
        <section id="contato" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Form */}
            {sections.contactForm && (
              <div
                className={`lg:col-span-6 p-7 sm:p-9 rounded-3xl border ${
                  cfg.darkMode
                    ? 'bg-[#111827] border-white/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3 className="text-2xl font-black mb-2">Fale Conosco Agora</h3>
                <p className="text-xs opacity-75 mb-6">
                  Preencha abaixo para receber atendimento imediato no seu WhatsApp ou ligue direto.
                </p>

                {contactSent ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    ✅ Mensagem encaminhada para nosso atendimento via WhatsApp!
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold block mb-1">Seu Nome</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Digite seu nome..."
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Seu Telefone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="(00) 90000-0000"
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Como podemos ajudar?</label>
                      <textarea
                        rows={3}
                        required
                        value={contactMsg}
                        onChange={e => setContactMsg(e.target.value)}
                        placeholder="Gostaria de agendar um horário / solicitar orçamento..."
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl font-extrabold text-white text-sm shadow-lg"
                      style={{ background: cfg.accentColor }}
                    >
                      Enviar Mensagem para o WhatsApp →
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-5 border-t border-current/10 space-y-2 text-xs">
                  <div>
                    📍 <strong>Endereço:</strong> {cfg.address}
                  </div>
                  <div>
                    🕒 <strong>Horário:</strong> {cfg.openingHours}
                  </div>
                  <div>
                    📞 <strong>Telefone / WhatsApp:</strong> +{cfg.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Embedded Google Map */}
            {sections.map && (
              <div
                className={`${
                  sections.contactForm ? 'lg:col-span-6' : 'lg:col-span-12'
                } rounded-3xl overflow-hidden border border-white/10 shadow-xl h-[380px]`}
              >
                <iframe
                  title={`Mapa de ${cfg.heroTitle}`}
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-8 px-4 text-center text-xs border-t"
          style={{
            borderColor: cfg.darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 opacity-75">
            <div>
              © {new Date().getFullYear()} <strong>{cfg.heroTitle}</strong> · Todos os direitos
              reservados.
            </div>
            {!site.removeBadge && (
              <div>{settings.brandFooterText || 'Desenvolvido por BlackDev Digital'}</div>
            )}
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          title="Falar no WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-extrabold text-xs sm:text-sm shadow-2xl transition-transform hover:scale-105"
          style={{ background: '#16A34A' }}
        >
          <span>💬</span>
          <span>Atendimento no WhatsApp</span>
        </a>
      </div>
    </>
  );
};

export default PublicSitePage;
