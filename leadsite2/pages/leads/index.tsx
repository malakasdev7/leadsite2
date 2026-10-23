import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import {
  ALL_CATEGORIES,
  BR_STATES_CITIES,
  getCategoriesForPlan,
  LEAD_TIER_STYLES,
} from '../../utils/leadsiteConstants';
import {
  buildInitialSiteConfig,
  GeneratedSite,
  LeadItem,
  loadLeads,
  loadQuota,
  loadSites,
  saveLeads,
  saveQuota,
  saveSites,
} from '../../utils/leadsiteStore';

const LeadsPage: NextPage = () => {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search form state
  const [stateUf, setStateUf] = useState('GO');
  const [city, setCity] = useState('Goiânia');
  const [neighborhood, setNeighborhood] = useState('');
  const [category, setCategory] = useState('Restaurante');
  const [limit, setLimit] = useState(6);
  const [onlyNoSite, setOnlyNoSite] = useState(false);
  const [onlyRecent, setOnlyRecent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [planCategories, setPlanCategories] = useState<string[]>(ALL_CATEGORIES);

  useEffect(() => {
    setLeads(loadLeads());
    setSites(loadSites());
    const q = loadQuota();
    setPlanCategories(getCategoriesForPlan(q.plan));
  }, []);

  const handleStateChange = (uf: string) => {
    setStateUf(uf);
    const cities = BR_STATES_CITIES[uf] || ['Centro'];
    setCity(cities[0]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateUf, city, neighborhood, category, limit }),
      });
      const data = await res.json();
      if (Array.isArray(data?.leads)) {
        const updated = [...data.leads, ...leads];
        setLeads(updated);
        saveLeads(updated);

        const q = loadQuota();
        const nextQuota = { ...q, leadsUsed: q.leadsUsed + data.leads.length };
        saveQuota(nextQuota);
        window.dispatchEvent(new Event('leadsite-quota-updated'));
      }
    } catch {
      alert('Erro ao buscar leads.');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const handleSendToCrm = (ids: string[]) => {
    if (ids.length === 0) return;
    const updated = leads.map(l => (ids.includes(l.id) ? { ...l, inCrm: true } : l));
    setLeads(updated);
    saveLeads(updated);
    setSelectedIds([]);
  };

  const handleExportCsv = () => {
    const target =
      selectedIds.length > 0 ? leads.filter(l => selectedIds.includes(l.id)) : filteredLeads;
    const header = [
      'Nome',
      'Categoria',
      'Cidade',
      'Estado',
      'Bairro',
      'Endereco',
      'Telefone',
      'Nota Google',
      'Avaliacoes',
      'Score',
      'Temperatura',
      'Diagnostico',
      'Responsavel',
    ];
    const rows = target.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.city}"`,
      `"${l.state}"`,
      `"${l.neighborhood || ''}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      l.rating,
      l.reviewsCount,
      l.score,
      l.tier,
      `"${l.flags.join(', ')}"`,
      `"${l.ownerName || ''}"`,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${city.toLowerCase()}-${category.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSite = (lead: LeadItem) => {
    setGeneratingId(lead.id);
    setTimeout(() => {
      const existing = sites.find(s => s.leadId === lead.id || s.id === lead.siteId);
      if (existing) {
        router.push(`/studio?siteId=${existing.id}`);
        return;
      }

      const slug = lead.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newSite: GeneratedSite = {
        id: `site-${Date.now()}`,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        leadId: lead.id,
        businessName: lead.name,
        category: lead.category,
        city: lead.city,
        state: lead.state,
        published: true,
        removeBadge: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentVersionIndex: 0,
        versions: [
          {
            versionNumber: 1,
            createdAt: new Date().toISOString(),
            instruction: 'Geração inicial automática via IA com dados reais do Google Maps',
            config: buildInitialSiteConfig(lead),
          },
        ],
      };

      const nextSites = [newSite, ...sites];
      setSites(nextSites);
      saveSites(nextSites);

      const nextLeads = leads.map(l =>
        l.id === lead.id ? { ...l, siteId: newSite.id, inCrm: true } : l
      );
      setLeads(nextLeads);
      saveLeads(nextLeads);

      const q = loadQuota();
      saveQuota({ ...q, sitesUsed: q.sitesUsed + 1 });
      window.dispatchEvent(new Event('leadsite-quota-updated'));

      router.push(`/studio?siteId=${newSite.id}`);
    }, 450);
  };

  const filteredLeads = leads.filter(l => {
    if (onlyNoSite && !l.flags.includes('Sem site') && !l.flags.includes('Site fora do ar')) {
      return false;
    }
    if (onlyRecent && !l.openedRecently) return false;
    return true;
  });

  return (
    <>
      <Head>
        <title>Buscar Leads Sem Site — LeadSite</title>
      </Head>

      <AppLayout
        title="Buscar Negócios Sem Site (Google Maps)"
        subtitle="Escolha o Estado, a Cidade e o Nicho para encontrar empresas locais sem site e gerar o site delas em 1 clique."
        actions={
          <>
            <button
              onClick={toggleSelectAll}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
            >
              {selectedIds.length === filteredLeads.length && filteredLeads.length > 0
                ? 'Desmarcar todos'
                : 'Selecionar todos'}
            </button>
            <button
              onClick={() => handleSendToCrm(selectedIds)}
              disabled={selectedIds.length === 0}
              className="text-[12.5px] font-bold px-4 py-2 rounded-xl text-white disabled:opacity-40"
              style={{ background: '#0071E3' }}
            >
              Enviar para CRM ({selectedIds.length})
            </button>
            <button
              onClick={handleExportCsv}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#1A7E3A]"
            >
              📥 Exportar CSV
            </button>
          </>
        }
      >
        {/* Search Bar Card */}
        <form onSubmit={handleSearch} className="glass-card rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1">
                Estado (UF)
              </label>
              <select
                value={stateUf}
                onChange={e => handleStateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-medium"
              >
                {Object.keys(BR_STATES_CITIES).map(uf => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1">
                Cidade
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-medium"
              >
                {(BR_STATES_CITIES[stateUf] || ['Centro']).map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1">
                Bairro (Opcional)
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                placeholder="Ex: Centro, Setor Bueno..."
                className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1">
                Categoria ({ALL_CATEGORIES.length} nichos)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-medium"
              >
                {ALL_CATEGORIES.map(cat => {
                  const unlocked = planCategories.includes(cat);
                  return (
                    <option key={cat} value={cat}>
                      {cat} {!unlocked ? '(Upgrade)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1">
                Quantidade: {limit} leads
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                  className="px-2.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px]"
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
                <button
                  type="submit"
                  disabled={searching}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-[13.5px] transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  {searching ? 'Varrendo Maps...' : '🔍 Buscar'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[--border-dim] flex flex-wrap items-center gap-5 text-[12.5px] text-[--text-3]">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNoSite}
                onChange={e => setOnlyNoSite(e.target.checked)}
                className="accent-[#0071E3]"
              />
              <span>Mostrar apenas Sem site / Site fora do ar</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyRecent}
                onChange={e => setOnlyRecent(e.target.checked)}
                className="accent-[#0071E3]"
              />
              <span>🔥 Negócios abertos recentemente (com nome do dono e contato)</span>
            </label>
            <span className="ml-auto text-[12px] text-[--text-4]">
              Exibindo <strong>{filteredLeads.length}</strong> estabelecimentos analisados
            </span>
          </div>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map(lead => {
            const tierStyle = LEAD_TIER_STYLES[lead.tier];
            const isSelected = selectedIds.includes(lead.id);
            const hasSite = Boolean(
              lead.siteId || sites.some(s => s.leadId === lead.id)
            );

            return (
              <div
                key={lead.id}
                className={`glass-card rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isSelected ? 'ring-2 ring-[#0071E3]' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(lead.id)}
                        className="mt-1 accent-[#0071E3]"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[15.5px] font-bold text-[--text] leading-snug truncate">
                          {lead.name}
                        </h3>
                        <p className="text-[12px] text-[--text-4] mt-0.5">
                          {lead.category} · {lead.city}/{lead.state}
                          {lead.neighborhood ? ` (${lead.neighborhood})` : ''}
                        </p>
                      </div>
                    </label>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className="text-[14px] font-extrabold"
                        style={{ color: tierStyle.color }}
                        title="Score de Oportunidade"
                      >
                        {lead.score} pts
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ color: tierStyle.color, background: tierStyle.bg }}
                      >
                        {tierStyle.label}
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {lead.flags.map(flag => (
                      <span
                        key={flag}
                        className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: flag === 'Sem site' ? '#D92D20' : '#B26B00',
                          background: flag === 'Sem site' ? '#FFF5F4' : 'rgba(255,159,10,0.16)',
                        }}
                      >
                        ● {flag}
                      </span>
                    ))}
                    {lead.openedRecently && (
                      <span
                        className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: '#0071E3', background: 'rgba(0,113,227,0.12)' }}
                      >
                        Recém-aberto
                      </span>
                    )}
                    {lead.inCrm && (
                      <span
                        className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: '#1A7E3A', background: 'rgba(48,209,88,0.14)' }}
                      >
                        ✓ No CRM ({lead.stage})
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3.5 space-y-1 text-[12.5px] text-[--text-3]">
                    <div>📍 {lead.address}</div>
                    <div>
                      ⭐ <strong>{lead.rating.toFixed(1)}</strong> ({lead.reviewsCount} avaliações no Google)
                    </div>
                    <div>📞 +{lead.phone}</div>
                    {lead.ownerName && (
                      <div>
                        👤 Sócio/Dono: <strong>{lead.ownerName}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-[--border-dim] flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateSite(lead)}
                    disabled={generatingId === lead.id}
                    className="flex-1 py-2 px-3 rounded-xl text-white font-bold text-[12.5px] transition-opacity hover:opacity-90"
                    style={{ background: hasSite ? '#1FA855' : '#0071E3' }}
                  >
                    {generatingId === lead.id
                      ? 'Gerando com IA...'
                      : hasSite
                      ? '🎨 Editar / Regerar Site'
                      : '✨ Gerar site com IA'}
                  </button>

                  {!lead.inCrm ? (
                    <button
                      onClick={() => handleSendToCrm([lead.id])}
                      className="py-2 px-3 rounded-xl border border-[--border] bg-[--bg-card] text-[12px] font-semibold hover:border-[#0071E3]"
                    >
                      + CRM
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/crm?leadId=${lead.id}`)}
                      className="py-2 px-3 rounded-xl border border-[--border] bg-[--bg-card] text-[12px] font-semibold text-[#0071E3]"
                    >
                      Abrir CRM →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AppLayout>
    </>
  );
};

export default LeadsPage;
