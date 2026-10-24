import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout, showToast } from '../../components/AppLayout';
import {
  GeneratedSite,
  loadSites,
  saveSites,
  SiteConfig,
  SitePublishStatus,
  SiteSectionsVisibility,
} from '../../utils/leadsiteStore';

type EditorTab = 'ai' | 'design' | 'services' | 'contact' | 'versions';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const DEFAULT_SECTIONS: SiteSectionsVisibility = {
  hero: true,
  services: true,
  about: true,
  gallery: true,
  testimonials: true,
  map: true,
  contactForm: true,
};

const StudioPage: NextPage = () => {
  const router = useRouter();
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>('');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [tab, setTab] = useState<EditorTab>('ai');
  const [instruction, setInstruction] = useState('');
  const [editing, setEditing] = useState(false);

  // Draft config for live visual editing
  const [draftConfig, setDraftConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const loaded = loadSites();
    setSites(loaded);
    const qId = typeof router.query.siteId === 'string' ? router.query.siteId : '';
    if (qId && loaded.some(s => s.id === qId)) {
      setActiveSiteId(qId);
    } else if (loaded.length > 0) {
      setActiveSiteId(loaded[0].id);
    }
  }, [router.query.siteId]);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0];

  useEffect(() => {
    if (activeSite) {
      const currentVer =
        activeSite.versions[activeSite.currentVersionIndex] || activeSite.versions[0];
      setDraftConfig({
        ...currentVer.config,
        sections: { ...DEFAULT_SECTIONS, ...(currentVer.config.sections || {}) },
      });
    }
  }, [activeSiteId, activeSite?.currentVersionIndex, sites.length]);

  if (!activeSite || !draftConfig) {
    return (
      <AppLayout title="Editor de Sites IA">
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-[14px] text-[--text-3] mb-4">
            Nenhum site gerado ainda. Vá até Buscar Leads e clique em &ldquo;Gerar site&rdquo;.
          </p>
          <Link
            href="/leads"
            className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-[13px]"
            style={{ background: '#2563EB' }}
          >
            Ir para Busca de Leads →
          </Link>
        </div>
      </AppLayout>
    );
  }

  const persistConfigUpdate = (nextConfig: SiteConfig, label = 'Edição manual no Studio') => {
    setDraftConfig(nextConfig);
    const nextVersionNumber = activeSite.versions.length + 1;
    const updatedSite: GeneratedSite = {
      ...activeSite,
      updatedAt: new Date().toISOString(),
      currentVersionIndex: activeSite.versions.length,
      versions: [
        ...activeSite.versions,
        {
          versionNumber: nextVersionNumber,
          createdAt: new Date().toISOString(),
          instruction: label,
          config: nextConfig,
        },
      ],
    };
    const nextSites = sites.map(s => (s.id === activeSite.id ? updatedSite : s));
    setSites(nextSites);
    saveSites(nextSites);
    showToast(`Versão v${nextVersionNumber} salva com sucesso!`, 'success');
  };

  const handleAiPrompt = async (promptText: string) => {
    if (!promptText.trim() || editing) return;
    setEditing(true);
    try {
      const res = await fetch('/api/sites/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: promptText,
          currentConfig: draftConfig,
        }),
      });
      const data = await res.json();
      if (data?.config) {
        persistConfigUpdate(data.config, `IA: ${promptText}`);
        setInstruction('');
      }
    } catch {
      showToast('Erro ao aplicar comando de IA.', 'error');
    } finally {
      setEditing(false);
    }
  };

  const handleRestoreVersion = (index: number) => {
    const updatedSite: GeneratedSite = {
      ...activeSite,
      currentVersionIndex: index,
      updatedAt: new Date().toISOString(),
    };
    const nextSites = sites.map(s => (s.id === activeSite.id ? updatedSite : s));
    setSites(nextSites);
    saveSites(nextSites);
    setDraftConfig(updatedSite.versions[index].config);
    showToast(`Versão v${updatedSite.versions[index].versionNumber} restaurada!`, 'info');
  };

  const handleStatusChange = (nextStatus: SitePublishStatus) => {
    const updatedSite: GeneratedSite = {
      ...activeSite,
      status: nextStatus,
      published: nextStatus === 'published',
      updatedAt: new Date().toISOString(),
    };
    const nextSites = sites.map(s => (s.id === activeSite.id ? updatedSite : s));
    setSites(nextSites);
    saveSites(nextSites);
    showToast(
      nextStatus === 'published'
        ? 'Site publicado e acessível no link público!'
        : nextStatus === 'archived'
        ? 'Site arquivado.'
        : 'Site despublicado (modo rascunho).',
      'success'
    );
  };

  const handleCopyPublicUrl = () => {
    const url = `${window.location.origin}/site/${activeSite.slug}`;
    navigator.clipboard.writeText(url);
    showToast(`Link público copiado: /site/${activeSite.slug}`, 'success');
  };

  const sections = draftConfig.sections || DEFAULT_SECTIONS;
  const pubStatus: SitePublishStatus =
    activeSite.status || (activeSite.published ? 'published' : 'draft');

  return (
    <>
      <Head>
        <title>Editor de Sites — {activeSite.businessName} · BlackDev Leads</title>
      </Head>

      <AppLayout
        title="Editor Visual & Conversacional de Sites"
        subtitle="Clique diretamente nos textos do site ao lado para editar ou use o painel lateral e o assistente IA."
        actions={
          <>
            <select
              value={activeSite.id}
              onChange={e => setActiveSiteId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px] font-bold"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.businessName} ({s.city}/{s.state})
                </option>
              ))}
            </select>

            <select
              value={pubStatus}
              onChange={e => handleStatusChange(e.target.value as SitePublishStatus)}
              className="px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12px] font-bold"
            >
              <option value="published">🟢 Publicado</option>
              <option value="draft">🟡 Despublicado (Rascunho)</option>
              <option value="archived">🔴 Arquivado</option>
            </select>

            <button
              onClick={() => persistConfigUpdate(draftConfig, 'Alterações salvas manualmente')}
              className="text-[12px] font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#2563EB' }}
            >
              💾 Salvar Versão
            </button>

            <button
              onClick={handleCopyPublicUrl}
              className="text-[12px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB]"
            >
              🔗 Copiar Link (/site/{activeSite.slug})
            </button>

            <Link
              href={`/site/${activeSite.slug}`}
              target="_blank"
              className="text-[12px] font-bold px-3.5 py-2 rounded-xl text-white"
              style={{ background: '#10B981' }}
            >
              🌐 Abrir Site Público ↗
            </Link>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Panel: 5 Tabs */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-5 flex flex-col gap-4">
            {/* Tabs Bar */}
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-[--bg-2] text-[11px] font-bold">
              {[
                { id: 'ai', label: '✨ Textos/IA' },
                { id: 'design', label: '🎨 Design' },
                { id: 'services', label: '🛠️ Seções' },
                { id: 'contact', label: '📞 Contato' },
                { id: 'versions', label: `🕒 v${activeSite.versions.length}` },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as EditorTab)}
                  className={`py-2 px-1 rounded-lg transition-all text-center truncate ${
                    tab === t.id
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[--text-3] hover:text-[--text]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Textos & IA */}
            {tab === 'ai' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30">
                  <div className="font-bold text-[#3B82F6] mb-1">
                    🤖 Edição com IA em Português
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={e => setInstruction(e.target.value)}
                      placeholder="Ex: mude para tema escuro e destaque atendimento 24h..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                    />
                    <button
                      type="button"
                      disabled={editing}
                      onClick={() => handleAiPrompt(instruction)}
                      className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white font-bold"
                    >
                      {editing ? '...' : 'Aplicar'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Título Principal (Hero)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.heroTitle}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, heroTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Subtítulo (Proposta de Valor)
                  </label>
                  <textarea
                    rows={2}
                    value={draftConfig.heroSubtitle}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, heroSubtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Texto do Botão Principal (CTA)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.ctaText}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, ctaText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Título da Seção Sobre
                  </label>
                  <input
                    type="text"
                    value={draftConfig.aboutTitle}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, aboutTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Texto Sobre o Negócio
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.aboutText}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, aboutText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div className="pt-2 border-t border-[--border-dim] space-y-2">
                  <div className="font-bold text-[--text-4] uppercase text-[10.5px]">
                    SEO Básico (Google & WhatsApp Preview)
                  </div>
                  <input
                    type="text"
                    value={draftConfig.seoTitle || ''}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, seoTitle: e.target.value })
                    }
                    placeholder="Meta Title (Título SEO)"
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                  <textarea
                    rows={2}
                    value={draftConfig.seoDescription || ''}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, seoDescription: e.target.value })
                    }
                    placeholder="Meta Description (Descrição para o Google)"
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Cores, Logo & Imagens */}
            {tab === 'design' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-[--text-3]">Cor Primária</label>
                    <input
                      type="color"
                      value={draftConfig.primaryColor}
                      onChange={e =>
                        setDraftConfig({ ...draftConfig, primaryColor: e.target.value })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer border border-[--border]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[--text-3]">Cor Secundária</label>
                    <input
                      type="color"
                      value={draftConfig.secondaryColor}
                      onChange={e =>
                        setDraftConfig({ ...draftConfig, secondaryColor: e.target.value })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer border border-[--border]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[--text-3]">Cor dos Botões</label>
                    <input
                      type="color"
                      value={draftConfig.accentColor}
                      onChange={e =>
                        setDraftConfig({ ...draftConfig, accentColor: e.target.value })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer border border-[--border]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={draftConfig.darkMode}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, darkMode: e.target.checked })
                    }
                    className="accent-[#2563EB]"
                  />
                  <span>Modo Escuro Premium no Site</span>
                </label>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Texto da Logo / Nome no Topo
                  </label>
                  <input
                    type="text"
                    value={draftConfig.logoText || draftConfig.heroTitle}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, logoText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    URL da Imagem de Logo (Opcional)
                  </label>
                  <input
                    type="url"
                    value={draftConfig.logoUrl || ''}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, logoUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Imagem Principal (Hero Banner URL)
                  </label>
                  <input
                    type="url"
                    value={draftConfig.heroImage || ''}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, heroImage: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Fotos da Galeria (1 URL por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={(draftConfig.galleryImages || []).join('\n')}
                    onChange={e =>
                      setDraftConfig({
                        ...draftConfig,
                        galleryImages: e.target.value
                          .split('\n')
                          .map(s => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Serviços & Seções */}
            {tab === 'services' && (
              <div className="space-y-4 text-xs max-h-[540px] overflow-y-auto pr-1">
                <div>
                  <div className="font-bold text-[--text-4] uppercase text-[10.5px] mb-2">
                    Seções Visíveis no Site
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ['hero', 'Capa (Hero)'],
                        ['services', 'Serviços'],
                        ['about', 'Quem Somos'],
                        ['gallery', 'Galeria de Fotos'],
                        ['testimonials', 'Avaliações'],
                        ['map', 'Mapa Google Maps'],
                        ['contactForm', 'Formulário Contato'],
                      ] as [keyof SiteSectionsVisibility, string][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 rounded-lg border border-[--border] bg-[--bg-card] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={sections[key]}
                          onChange={e =>
                            setDraftConfig({
                              ...draftConfig,
                              sections: { ...sections, [key]: e.target.checked },
                            })
                          }
                          className="accent-[#2563EB]"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[--border-dim] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[--text-4] uppercase text-[10.5px]">
                      Serviços / Produtos ({draftConfig.services.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftConfig({
                          ...draftConfig,
                          services: [
                            ...draftConfig.services,
                            {
                              title: 'Novo Serviço Especializado',
                              description: 'Descrição detalhada do serviço com garantia.',
                              price: 'Sob consulta',
                            },
                          ],
                        })
                      }
                      className="text-[11px] font-bold text-[#3B82F6] hover:underline"
                    >
                      + Adicionar serviço
                    </button>
                  </div>

                  {draftConfig.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[--border] bg-[--bg-card] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={srv.title}
                          onChange={e => {
                            const next = [...draftConfig.services];
                            next[idx] = { ...srv, title: e.target.value };
                            setDraftConfig({ ...draftConfig, services: next });
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg] font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = draftConfig.services.filter((_, i) => i !== idx);
                            setDraftConfig({ ...draftConfig, services: next });
                          }}
                          className="text-red-400 font-bold px-2"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={srv.description}
                        onChange={e => {
                          const next = [...draftConfig.services];
                          next[idx] = { ...srv, description: e.target.value };
                          setDraftConfig({ ...draftConfig, services: next });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg]"
                      />
                      <input
                        type="text"
                        value={srv.price || ''}
                        onChange={e => {
                          const next = [...draftConfig.services];
                          next[idx] = { ...srv, price: e.target.value };
                          setDraftConfig({ ...draftConfig, services: next });
                        }}
                        placeholder="Preço ou destaque (ex: R$ 80,00)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Contato & WhatsApp */}
            {tab === 'contact' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Telefone & WhatsApp (com DDD)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.phone}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Mensagem Automática do Botão WhatsApp
                  </label>
                  <textarea
                    rows={2}
                    value={draftConfig.whatsappMessage}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, whatsappMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Endereço Completo (usado no Mapa)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.address}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={draftConfig.openingHours}
                    onChange={e =>
                      setDraftConfig({ ...draftConfig, openingHours: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: Histórico de Versões */}
            {tab === 'versions' && (
              <div className="space-y-2.5 text-xs max-h-[500px] overflow-y-auto">
                <div className="font-bold text-[--text-4] uppercase text-[10.5px]">
                  Histórico de Versões ({activeSite.versions.length})
                </div>
                {activeSite.versions
                  .map((v, idx) => ({ v, idx }))
                  .reverse()
                  .map(({ v, idx }) => {
                    const isCurrent = idx === activeSite.currentVersionIndex;
                    return (
                      <div
                        key={v.versionNumber}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'border-[#2563EB] bg-[#2563EB]/10'
                            : 'border-[--border] bg-[--bg-card]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[--text]">
                            Versão #{v.versionNumber}{' '}
                            {isCurrent && (
                              <span className="text-[10px] text-[#3B82F6]">(Ativa)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[--text-4] truncate">
                            {v.instruction}
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRestoreVersion(idx)}
                            className="px-2.5 py-1 rounded-lg border border-[--border] font-bold hover:border-[#2563EB] shrink-0"
                          >
                            Restaurar ↺
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Right Live Preview Canvas (with Direct Click-to-Edit Text!) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Viewport Bar */}
            <div className="glass-card rounded-t-2xl px-4 py-2.5 border-b border-[--border-dim] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-[--text-4]">
                <span className="font-mono truncate">
                  /site/{activeSite.slug}
                </span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#3B82F6] font-bold">
                  ✏️ Clique em qualquer texto abaixo para editar ao vivo
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(
                  [
                    ['desktop', '🖥️ Desktop'],
                    ['tablet', '📟 Tablet'],
                    ['mobile', '📱 Celular'],
                  ] as [ViewportSize, string][]
                ).map(([vp, label]) => (
                  <button
                    key={vp}
                    type="button"
                    onClick={() => setViewport(vp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      viewport === vp
                        ? 'bg-[#2563EB] text-white'
                        : 'text-[--text-3] hover:bg-[--bg-2]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Live Preview Container */}
            <div className="glass-card rounded-b-2xl p-4 bg-[--bg-2] flex justify-center overflow-x-auto">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-[--border] ${
                  viewport === 'mobile'
                    ? 'w-[375px]'
                    : viewport === 'tablet'
                    ? 'w-[640px]'
                    : 'w-full'
                } ${
                  draftConfig.darkMode
                    ? 'bg-[#090D16] text-white'
                    : 'bg-white text-slate-900'
                }`}
              >
                {/* Live Hero */}
                {sections.hero && (
                  <div
                    className="p-8 sm:p-10 text-center space-y-4"
                    style={{
                      background: `linear-gradient(135deg, ${draftConfig.primaryColor} 0%, ${draftConfig.secondaryColor} 100%)`,
                      color: '#FFFFFF',
                    }}
                  >
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        setDraftConfig({
                          ...draftConfig,
                          badgeText: e.currentTarget.textContent || '',
                        })
                      }
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 outline-dashed outline-1 outline-transparent focus:outline-white/60 cursor-text"
                    >
                      {draftConfig.badgeText}
                    </span>

                    <h2
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        setDraftConfig({
                          ...draftConfig,
                          heroTitle: e.currentTarget.textContent || '',
                        })
                      }
                      className="text-2xl sm:text-3xl font-black leading-tight outline-dashed outline-1 outline-transparent focus:outline-white/60 cursor-text"
                    >
                      {draftConfig.heroTitle}
                    </h2>

                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        setDraftConfig({
                          ...draftConfig,
                          heroSubtitle: e.currentTarget.textContent || '',
                        })
                      }
                      className="text-xs sm:text-sm text-white/85 max-w-lg mx-auto outline-dashed outline-1 outline-transparent focus:outline-white/60 cursor-text"
                    >
                      {draftConfig.heroSubtitle}
                    </p>

                    {draftConfig.heroImage && (
                      <div className="max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg my-3">
                        <img
                          src={draftConfig.heroImage}
                          alt={draftConfig.heroTitle}
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    )}

                    <div className="pt-1">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e =>
                          setDraftConfig({
                            ...draftConfig,
                            ctaText: e.currentTarget.textContent || '',
                          })
                        }
                        className="inline-block px-6 py-3 rounded-xl font-extrabold text-xs text-white shadow-lg cursor-text"
                        style={{ background: draftConfig.accentColor }}
                      >
                        💬 {draftConfig.ctaText}
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Services */}
                {sections.services && (
                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="text-base font-extrabold text-center">
                      Nossos Serviços e Especialidades
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {draftConfig.services.map((srv, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            draftConfig.darkMode
                              ? 'bg-[#111827] border-white/10'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => {
                              const next = [...draftConfig.services];
                              next[idx] = {
                                ...srv,
                                title: e.currentTarget.textContent || '',
                              };
                              setDraftConfig({ ...draftConfig, services: next });
                            }}
                            className="font-bold text-xs mb-1 cursor-text"
                          >
                            {srv.title}
                          </div>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => {
                              const next = [...draftConfig.services];
                              next[idx] = {
                                ...srv,
                                description: e.currentTarget.textContent || '',
                              };
                              setDraftConfig({ ...draftConfig, services: next });
                            }}
                            className="text-[11px] opacity-75 cursor-text"
                          >
                            {srv.description}
                          </p>
                          {srv.price && (
                            <div
                              className="mt-2 text-[11px] font-extrabold"
                              style={{ color: draftConfig.accentColor }}
                            >
                              {srv.price}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live About */}
                {sections.about && (
                  <div
                    className={`p-6 sm:p-8 border-t ${
                      draftConfig.darkMode ? 'border-white/10' : 'border-slate-200'
                    }`}
                  >
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        setDraftConfig({
                          ...draftConfig,
                          aboutTitle: e.currentTarget.textContent || '',
                        })
                      }
                      className="text-base font-extrabold mb-2 cursor-text"
                    >
                      {draftConfig.aboutTitle}
                    </h3>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        setDraftConfig({
                          ...draftConfig,
                          aboutText: e.currentTarget.textContent || '',
                        })
                      }
                      className="text-xs leading-relaxed opacity-85 cursor-text"
                    >
                      {draftConfig.aboutText}
                    </p>
                  </div>
                )}

                {/* Live Footer Info */}
                <div
                  className={`p-5 text-center text-[11px] border-t ${
                    draftConfig.darkMode
                      ? 'bg-[#060911] border-white/10 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  📍 {draftConfig.address} · 🕒 {draftConfig.openingHours} · 📞 +
                  {draftConfig.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default StudioPage;
