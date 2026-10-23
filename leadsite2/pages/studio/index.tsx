import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { ALL_CATEGORIES } from '../../utils/leadsiteConstants';
import {
  buildInitialSiteConfig,
  GeneratedSite,
  loadQuota,
  loadSites,
  saveQuota,
  saveSites,
} from '../../utils/leadsiteStore';

const QUICK_PROMPTS = [
  'deixe o botão verde',
  'tema escuro premium',
  'mude o botão para "Agendar Horário no WhatsApp"',
  'adicione desconto de 15% na primeira visita',
  'deixe as cores em azul royal',
  'deixe as cores em dourado e preto',
];

const StudioPage: NextPage = () => {
  const router = useRouter();
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [chatInput, setChatInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New custom business form ("Crie sites pra quem não está na busca")
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Restaurante');
  const [customCity, setCustomCity] = useState('São Paulo');
  const [customPhone, setCustomPhone] = useState('5511999999999');

  useEffect(() => {
    const loaded = loadSites();
    setSites(loaded);
    const qSiteId = typeof router.query.siteId === 'string' ? router.query.siteId : '';
    if (qSiteId && loaded.some(s => s.id === qSiteId)) {
      setActiveSiteId(qSiteId);
    } else if (loaded.length > 0) {
      setActiveSiteId(loaded[0].id);
    }
  }, [router.query.siteId]);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0];
  const currentVersion =
    activeSite?.versions[activeSite.currentVersionIndex] || activeSite?.versions[0];
  const cfg = currentVersion?.config;

  const handleApplyChatEdit = async (instructionText?: string) => {
    const prompt = (instructionText ?? chatInput).trim();
    if (!prompt || !activeSite || !cfg) return;
    setEditing(true);
    try {
      const res = await fetch('/api/sites/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: cfg, instruction: prompt }),
      });
      const data = await res.json();
      if (data?.config) {
        const nextVersionNumber = activeSite.versions.length + 1;
        const newVersion = {
          versionNumber: nextVersionNumber,
          createdAt: new Date().toISOString(),
          instruction: prompt,
          config: data.config,
        };
        const updatedSites = sites.map(s => {
          if (s.id !== activeSite.id) return s;
          const nextVersions = [...s.versions, newVersion];
          return {
            ...s,
            versions: nextVersions,
            currentVersionIndex: nextVersions.length - 1,
            updatedAt: new Date().toISOString(),
          };
        });
        setSites(updatedSites);
        saveSites(updatedSites);
        setChatInput('');

        const q = loadQuota();
        saveQuota({ ...q, editsUsed: q.editsUsed + 1 });
        window.dispatchEvent(new Event('leadsite-quota-updated'));
      }
    } catch {
      alert('Erro ao aplicar edição no site.');
    } finally {
      setEditing(false);
    }
  };

  const handleRollbackVersion = (idx: number) => {
    if (!activeSite) return;
    const updatedSites = sites.map(s =>
      s.id === activeSite.id ? { ...s, currentVersionIndex: idx, updatedAt: new Date().toISOString() } : s
    );
    setSites(updatedSites);
    saveSites(updatedSites);
  };

  const handleTogglePublish = () => {
    if (!activeSite) return;
    const updatedSites = sites.map(s =>
      s.id === activeSite.id ? { ...s, published: !s.published } : s
    );
    setSites(updatedSites);
    saveSites(updatedSites);
  };

  const handleCopyUrl = () => {
    if (!activeSite) return;
    const publicUrl = `${window.location.origin}/s/${activeSite.slug}`;
    navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const slug = customName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const mockLead = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      state: 'SP',
      city: customCity.trim() || 'São Paulo',
      address: `Centro, ${customCity.trim() || 'São Paulo'}`,
      phone: customPhone.replace(/\D/g, '') || '5511999999999',
      rating: 4.9,
      reviewsCount: 85,
      score: 90,
      tier: 'quente' as const,
      flags: ['Sem site' as const],
      stage: 'Base' as const,
      inCrm: true,
      createdAt: new Date().toISOString(),
    };

    const newSite: GeneratedSite = {
      id: `site-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      leadId: mockLead.id,
      businessName: mockLead.name,
      category: mockLead.category,
      city: mockLead.city,
      state: mockLead.state,
      published: true,
      removeBadge: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersionIndex: 0,
      versions: [
        {
          versionNumber: 1,
          createdAt: new Date().toISOString(),
          instruction: 'Criado manualmente fora da busca com IA',
          config: buildInitialSiteConfig(mockLead),
        },
      ],
    };

    const updated = [newSite, ...sites];
    setSites(updated);
    saveSites(updated);
    setActiveSiteId(newSite.id);
    setShowNewModal(false);
    setCustomName('');
  };

  return (
    <>
      <Head>
        <title>Editor de Site IA (/studio) — LeadSite</title>
      </Head>

      <AppLayout
        title="Editor Conversacional de Site IA"
        subtitle="Clique em qualquer elemento ou descreva a alteração em português no chat. Cada mudança salva uma versão no histórico."
        actions={
          <>
            <select
              value={activeSite?.id || ''}
              onChange={e => setActiveSiteId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[13px] font-semibold"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.businessName} ({s.category})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowNewModal(true)}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
            >
              + Criar site avulso
            </button>

            {activeSite && (
              <>
                <button
                  onClick={handleCopyUrl}
                  className="text-[12.5px] font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: '#0071E3' }}
                >
                  {copied ? '✓ Link Copiado!' : '🔗 Copiar URL Pública'}
                </button>
                <Link
                  href={`/s/${activeSite.slug}`}
                  target="_blank"
                  className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#1A7E3A]"
                >
                  Abrir Site ↗
                </Link>
              </>
            )}
          </>
        }
      >
        {showNewModal && (
          <div className="glass-card rounded-2xl p-5 mb-6 border border-[#0071E3]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold">Criar site para empresa fora da busca</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[13px] text-[--text-4]">
                ✕ Fechar
              </button>
            </div>
            <form onSubmit={handleCreateCustomSite} className="grid sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Nome do Negócio"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[13px]"
              />
              <select
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[13px]"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Cidade"
                value={customCity}
                onChange={e => setCustomCity(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[13px]"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl text-white font-bold text-[13px]"
                style={{ background: '#0071E3' }}
              >
                Gerar Site Agora
              </button>
            </form>
          </div>
        )}

        {activeSite && cfg ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Left Column: Live Interactive Site Preview */}
            <div className="glass-card rounded-2xl overflow-hidden border border-[--border-dim]">
              {/* Browser Top Bar */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[--border-dim] bg-[--bg-2]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  <span className="ml-2 text-[11.5px] font-mono text-[--text-3] bg-[--bg-card] px-3 py-1 rounded-md border border-[--border-dim]">
                    {activeSite.slug}.useleadsite.com
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewport('desktop')}
                    className={`text-[11.5px] px-2.5 py-1 rounded-md font-semibold ${
                      viewport === 'desktop' ? 'bg-[#0071E3] text-white' : 'text-[--text-3]'
                    }`}
                  >
                    💻 Desktop
                  </button>
                  <button
                    onClick={() => setViewport('mobile')}
                    className={`text-[11.5px] px-2.5 py-1 rounded-md font-semibold ${
                      viewport === 'mobile' ? 'bg-[#0071E3] text-white' : 'text-[--text-3]'
                    }`}
                  >
                    📱 Celular
                  </button>
                </div>
              </div>

              {/* Site Canvas */}
              <div className="p-4 bg-[--bg-dark]/30 flex justify-center">
                <div
                  className={`w-full transition-all rounded-xl overflow-hidden shadow-lg border border-[--border-dim] ${
                    viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
                  }`}
                  style={{
                    background: cfg.darkMode ? '#0B0F19' : '#FFFFFF',
                    color: cfg.darkMode ? '#F9FAFB' : '#111827',
                  }}
                >
                  {/* Hero Banner */}
                  <div
                    className="px-6 py-14 text-center text-white relative"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.primaryColor} 0%, ${cfg.secondaryColor} 100%)`,
                    }}
                  >
                    <span className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full bg-white/15 text-white/90 mb-4">
                      {cfg.badgeText}
                    </span>
                    <h2
                      onClick={() => setChatInput(`mude o título para "${cfg.heroTitle}"`)}
                      className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-extrabold leading-tight cursor-pointer hover:underline"
                      title="Clique para editar este título no chat"
                    >
                      {cfg.heroTitle}
                    </h2>
                    <p
                      onClick={() => setChatInput(`mude o subtítulo para "${cfg.heroSubtitle}"`)}
                      className="mt-3 text-[15px] text-white/85 max-w-xl mx-auto cursor-pointer hover:underline"
                      title="Clique para editar este subtítulo no chat"
                    >
                      {cfg.heroSubtitle}
                    </p>
                    <div className="mt-6">
                      <a
                        href={`https://wa.me/${cfg.phone}?text=${encodeURIComponent(cfg.whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-bold px-7 py-3.5 rounded-full text-white shadow-lg transition-transform hover:scale-105"
                        style={{ background: cfg.accentColor }}
                      >
                        💬 {cfg.ctaText}
                      </a>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="p-6 sm:p-8">
                    <h3 className="text-[18px] font-bold text-center mb-6">
                      Nossos Serviços & Destaques
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {cfg.services.map((srv, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl p-4 border"
                          style={{
                            borderColor: cfg.darkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                            background: cfg.darkMode ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                          }}
                        >
                          <div className="font-bold text-[14.5px]">{srv.title}</div>
                          <p
                            className="text-[12.5px] mt-1.5 leading-relaxed"
                            style={{ color: cfg.darkMode ? '#9CA3AF' : '#4B5563' }}
                          >
                            {srv.description}
                          </p>
                          {srv.price && (
                            <div
                              className="mt-3 text-[12px] font-extrabold"
                              style={{ color: cfg.accentColor }}
                            >
                              {srv.price}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonials */}
                  <div
                    className="px-6 py-8 border-t"
                    style={{
                      borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
                      background: cfg.darkMode ? '#111827' : '#F8FAFC',
                    }}
                  >
                    <h3 className="text-[17px] font-bold text-center mb-5">
                      O que dizem nossos clientes no Google
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {cfg.testimonials.map((t, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-4 border"
                          style={{
                            background: cfg.darkMode ? '#1F2937' : '#FFFFFF',
                            borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                          }}
                        >
                          <div className="text-[#FF9F0A] text-[13px] mb-1">★★★★★</div>
                          <p className="text-[12.5px] italic">“{t.text}”</p>
                          <div className="mt-2 text-[11.5px] font-bold">{t.author}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About & Contact Footer */}
                  <div
                    className="px-6 py-8 border-t text-center text-[13px]"
                    style={{
                      borderColor: cfg.darkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                    }}
                  >
                    <div className="font-bold text-[15px] mb-1">{cfg.aboutTitle}</div>
                    <p
                      className="max-w-xl mx-auto text-[12.5px] leading-relaxed mb-4"
                      style={{ color: cfg.darkMode ? '#9CA3AF' : '#4B5563' }}
                    >
                      {cfg.aboutText}
                    </p>
                    <div className="text-[12px] font-medium">📍 {cfg.address}</div>
                    <div className="text-[12px] mt-1">🕒 {cfg.openingHours}</div>
                    {!activeSite.removeBadge && (
                      <div className="mt-4 pt-3 border-t border-black/5 text-[11px] opacity-60">
                        Criado e hospedado com <strong>LeadSite IA</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Conversational Chat Editor + Version History */}
            <div className="space-y-5">
              {/* Chat Editor Box */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] font-bold text-[--text]">
                    ✨ Editar conversando (IA)
                  </h3>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: '#0071E3', background: 'rgba(0,113,227,0.12)' }}
                  >
                    Versão v{currentVersion.versionNumber}
                  </span>
                </div>
                <p className="text-[12px] text-[--text-3] mb-3">
                  Descreva o que deseja alterar em português. Cada pedido cria uma nova versão.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {QUICK_PROMPTS.map(qp => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => handleApplyChatEdit(qp)}
                      disabled={editing}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-[--border] bg-[--bg-card] hover:border-[#0071E3] text-[--text-2] transition-colors"
                    >
                      “{qp}”
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleApplyChatEdit();
                  }}
                  className="space-y-2.5"
                >
                  <textarea
                    rows={3}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder='Ex: "deixe o botão verde", "mude o título para...", "tema escuro"'
                    className="w-full p-3 rounded-xl border border-[--border] bg-[--bg-card] text-[13px]"
                  />
                  <button
                    type="submit"
                    disabled={editing || !chatInput.trim()}
                    className="w-full py-2.5 rounded-xl text-white font-bold text-[13.5px] disabled:opacity-50"
                    style={{ background: '#0071E3' }}
                  >
                    {editing ? 'Aplicando mudança com IA...' : 'Aplicar alteração no site →'}
                  </button>
                </form>
              </div>

              {/* Version History Rollback Card */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-[14.5px] font-bold text-[--text] mb-3">
                  🕒 Histórico de versões ({activeSite.versions.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeSite.versions.map((ver, idx) => {
                    const isCurrent = idx === activeSite.currentVersionIndex;
                    return (
                      <div
                        key={ver.versionNumber}
                        className={`p-3 rounded-xl border text-[12px] flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'border-[#0071E3] bg-[--bg-2]'
                            : 'border-[--border-dim] bg-[--bg-card]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[--text]">
                            Versão #{ver.versionNumber}{' '}
                            {isCurrent && (
                              <span className="text-[#0071E3] text-[10.5px] ml-1">(Ativa)</span>
                            )}
                          </div>
                          <div className="text-[--text-3] truncate" title={ver.instruction}>
                            “{ver.instruction}”
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => handleRollbackVersion(idx)}
                            className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-[--border] hover:border-[#0071E3] text-[#0071E3]"
                          >
                            Voltar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Publication & Domain Settings */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold">Status de Publicação</span>
                  <button
                    onClick={handleTogglePublish}
                    className="text-[11.5px] font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: activeSite.published ? '#1FA855' : '#8E8E93' }}
                  >
                    {activeSite.published ? '● Publicado no Ar' : '○ Rascunho'}
                  </button>
                </div>
                <div className="text-[12px] text-[--text-3]">
                  Link público gratuito incluso:
                  <div className="mt-1 font-mono text-[11.5px] p-2 rounded-lg bg-[--bg-2] border border-[--border-dim] truncate">
                    /s/{activeSite.slug}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-[15px] text-[--text-3]">Nenhum site selecionado.</p>
            <Link
              href="/leads"
              className="mt-4 inline-block px-6 py-2.5 rounded-full text-white font-bold text-[13.5px]"
              style={{ background: '#0071E3' }}
            >
              Ir para Buscar Leads
            </Link>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default StudioPage;
