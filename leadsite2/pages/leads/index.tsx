import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout, showToast } from '../../components/AppLayout';
import { FEATURED_NICHES } from '../../utils/leadsiteConstants';
import {
  buildInitialSiteConfig,
  GeneratedSite,
  LeadItem,
  loadLeads,
  loadSites,
  saveLeads,
  saveSites,
} from '../../utils/leadsiteStore';

export interface MapsPlaceLead {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  telefone: string;
  site: string;
  nota: number;
  avaliacoes: number;
  google_maps_url: string;
  latitude: number;
  longitude: number;
  tem_site: boolean;
  inCrm?: boolean;
  isDuplicate?: boolean;
}

type QuickFilter = 'todos' | 'sem_site' | 'com_site' | 'bem_avaliados';

function parseCityStateFromAddress(endereco: string, fallbackLocation: string): {
  city: string;
  state: string;
} {
  const locParts = fallbackLocation.split(',').map(s => s.trim());
  const defaultCity = locParts[0] || 'Barreiras';
  const defaultState =
    locParts[1]?.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2) || 'BA';

  const match = endereco.match(/([^,-]+)\s*-\s*([A-Z]{2})\b/);
  if (match) {
    return {
      city: match[1].trim() || defaultCity,
      state: match[2].trim() || defaultState,
    };
  }
  return { city: defaultCity, state: defaultState };
}

const LeadsPage: NextPage = () => {
  const router = useRouter();

  // Search inputs connected to POST /api/maps/search
  const [query, setQuery] = useState('restaurante');
  const [location, setLocation] = useState('Barreiras, BA');
  const [limit, setLimit] = useState<number>(20);

  // Results & UI state
  const [results, setResults] = useState<MapsPlaceLead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sendingCrm, setSendingCrm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailLead, setDetailLead] = useState<MapsPlaceLead | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [sites, setSites] = useState<GeneratedSite[]>([]);

  useEffect(() => {
    setSites(loadSites());
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!query.trim()) {
      setErrorMsg('Digite o tipo de negócio que deseja buscar (ex: restaurante, barbearia).');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Digite a cidade ou região da busca (ex: Barreiras, BA).');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch('/api/maps/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          location: location.trim(),
          limit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || 'Erro ao buscar negócios na Google Places API.');
        setSearching(false);
        return;
      }

      const rawLeads = Array.isArray(data?.leads) ? data.leads : [];
      const mapped: MapsPlaceLead[] = rawLeads.map((item: any, idx: number) => ({
        id: `place-${Date.now()}-${idx}`,
        nome: item.nome || 'Estabelecimento sem nome',
        categoria: item.categoria || query.trim(),
        endereco: item.endereco || location.trim(),
        telefone: item.telefone || '',
        site: item.site || '',
        nota: Number(item.nota || 0),
        avaliacoes: Number(item.avaliacoes || 0),
        google_maps_url: item.google_maps_url || '',
        latitude: Number(item.latitude || 0),
        longitude: Number(item.longitude || 0),
        tem_site: Boolean(item.tem_site),
        inCrm: false,
      }));

      setResults(mapped);
      setHasSearched(true);
      setSelectedIds([]);
      showToast(
        `${mapped.length} negócios encontrados para "${query}" em "${location}"!`,
        'success'
      );
    } catch {
      setErrorMsg(
        'Não foi possível conectar ao servidor para realizar a busca. Tente novamente.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleResetSearch = () => {
    setQuery('');
    setLocation('');
    setResults([]);
    setSelectedIds([]);
    setErrorMsg('');
    setHasSearched(false);
    setQuickFilter('todos');
  };

  const filteredResults = results.filter(item => {
    if (quickFilter === 'sem_site') return !item.tem_site;
    if (quickFilter === 'com_site') return item.tem_site;
    if (quickFilter === 'bem_avaliados') return item.nota >= 4.5;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredResults.map(r => r.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleSendLeadsToCrm = async (leadsToSave: MapsPlaceLead[]) => {
    if (leadsToSave.length === 0 || sendingCrm) return;

    if (
      leadsToSave.length > 5 &&
      !window.confirm(
        `Deseja enviar ${leadsToSave.length} leads selecionados para o CRM no Supabase?`
      )
    ) {
      return;
    }

    setSendingCrm(true);
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToSave }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || 'Erro ao salvar leads no CRM.', 'error');
        setSendingCrm(false);
        return;
      }

      // Also sync into local CRM store so /crm and /dashboard reflect immediately
      const currentLocalLeads = loadLeads();
      const existingLocalKeys = new Set(
        currentLocalLeads.map(
          l => `${l.name.toLowerCase().trim()}::${l.address.toLowerCase().trim()}`
        )
      );
      const existingLocalPhones = new Set(
        currentLocalLeads
          .map(l => (l.phone || '').replace(/\D/g, ''))
          .filter(Boolean)
      );

      const newLocalItems: LeadItem[] = [];
      for (const item of leadsToSave) {
        const key = `${item.nome.toLowerCase().trim()}::${item.endereco
          .toLowerCase()
          .trim()}`;
        const cleanPhone = (item.telefone || '').replace(/\D/g, '');
        if (
          existingLocalKeys.has(key) ||
          (cleanPhone && existingLocalPhones.has(cleanPhone))
        ) {
          continue;
        }
        existingLocalKeys.add(key);
        if (cleanPhone) existingLocalPhones.add(cleanPhone);

        const { city, state } = parseCityStateFromAddress(item.endereco, location);
        newLocalItems.push({
          id: `crm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: item.nome,
          category: item.categoria || query || 'Negócio Local',
          state,
          city,
          address: item.endereco,
          phone: item.telefone || '',
          whatsapp: cleanPhone,
          website: item.site || '',
          googleMapsUrl: item.google_maps_url || '',
          rating: item.nota || 4.8,
          reviewsCount: item.avaliacoes || 0,
          score: item.tem_site ? 72 : 95,
          tier: item.tem_site ? 'morno' : 'quente',
          flags: item.tem_site ? ['Site desatualizado'] : ['Sem site'],
          stage: 'Novo lead',
          inCrm: true,
          estimatedValue: 1500,
          source: 'google_maps',
          createdAt: new Date().toISOString(),
        });
      }

      if (newLocalItems.length > 0) {
        saveLeads([...newLocalItems, ...currentLocalLeads]);
      }

      const targetIds = new Set(leadsToSave.map(l => l.id));
      const dupNames = new Set(
        Array.isArray(data?.duplicates) ? data.duplicates : []
      );

      setResults(prev =>
        prev.map(r =>
          targetIds.has(r.id)
            ? {
                ...r,
                inCrm: true,
                isDuplicate: dupNames.has(r.nome),
              }
            : r
        )
      );
      setSelectedIds([]);

      const insertedCount = data?.insertedCount ?? leadsToSave.length;
      const duplicateCount = data?.duplicateCount ?? 0;

      if (insertedCount > 0 && duplicateCount > 0) {
        showToast(
          `${insertedCount} lead(s) salvo(s) no Supabase (${duplicateCount} duplicado(s) ignorado(s)).`,
          'success'
        );
      } else if (insertedCount > 0) {
        showToast(
          `${insertedCount} lead(s) enviado(s) para o CRM e salvo(s) no Supabase!`,
          'success'
        );
      } else {
        showToast(
          'Os leads selecionados já estavam cadastrados no CRM (duplicidade evitada).',
          'info'
        );
      }
    } catch {
      showToast('Falha ao enviar leads para o CRM.', 'error');
    } finally {
      setSendingCrm(false);
    }
  };

  const handleGenerateSiteForLead = (place: MapsPlaceLead) => {
    setGeneratingId(place.id);
    setTimeout(() => {
      const { city, state } = parseCityStateFromAddress(place.endereco, location);
      const cleanPhone = (place.telefone || '').replace(/\D/g, '');

      const leadForSite: LeadItem = {
        id: place.id,
        name: place.nome,
        category: place.categoria || query || 'Negócio Local',
        state,
        city,
        address: place.endereco,
        phone: cleanPhone || '5511999999999',
        whatsapp: cleanPhone || '5511999999999',
        website: place.site || '',
        googleMapsUrl: place.google_maps_url || '',
        rating: place.nota || 4.8,
        reviewsCount: place.avaliacoes || 25,
        score: place.tem_site ? 75 : 95,
        tier: place.tem_site ? 'morno' : 'quente',
        flags: place.tem_site ? ['Site desatualizado'] : ['Sem site'],
        stage: 'Novo lead',
        inCrm: true,
        createdAt: new Date().toISOString(),
      };

      const existing = sites.find(
        s => s.businessName.toLowerCase() === place.nome.toLowerCase()
      );
      const freshConfig = buildInitialSiteConfig(leadForSite);

      if (existing) {
        router.push(`/studio?siteId=${existing.id}`);
        return;
      }

      const slug = place.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newSite: GeneratedSite = {
        id: `site-${Date.now()}`,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        leadId: leadForSite.id,
        businessName: place.nome,
        category: leadForSite.category,
        city,
        state,
        published: true,
        status: 'published',
        removeBadge: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentVersionIndex: 0,
        versions: [
          {
            versionNumber: 1,
            createdAt: new Date().toISOString(),
            instruction: place.tem_site
              ? 'Proposta de site moderno melhorado gerada via Google Places API'
              : 'Site profissional gerado automaticamente para negócio sem site',
            config: freshConfig,
          },
        ],
      };

      const nextSites = [newSite, ...sites];
      setSites(nextSites);
      saveSites(nextSites);

      const currentLeads = loadLeads();
      saveLeads([
        { ...leadForSite, siteId: newSite.id, inCrm: true },
        ...currentLeads,
      ]);

      showToast(`Site preparado para "${place.nome}"! Abrindo editor...`, 'success');
      router.push(`/studio?siteId=${newSite.id}`);
    }, 300);
  };

  const countSemSite = results.filter(r => !r.tem_site).length;
  const countComSite = results.filter(r => r.tem_site).length;
  const countBemAvaliados = results.filter(r => r.nota >= 4.5).length;

  return (
    <>
      <Head>
        <title>Busca de Leads no Google Maps — BlackDev Leads</title>
      </Head>

      <AppLayout
        title="Buscar Negócios Locais (Google Places API)"
        subtitle="Encontre empresas reais no Google Maps, identifique quem não possui site e envie diretamente para o seu CRM no Supabase."
        actions={
          <>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={filteredResults.length === 0}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB] disabled:opacity-40"
            >
              Selecionar todos ({filteredResults.length})
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={selectedIds.length === 0}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#EF4444] disabled:opacity-40"
            >
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendLeadsToCrm(results.filter(r => selectedIds.includes(r.id)))
              }
              disabled={selectedIds.length === 0 || sendingCrm}
              className="text-[12.5px] font-bold px-4 py-2 rounded-xl text-white disabled:opacity-40 shadow-sm"
              style={{ background: '#2563EB' }}
            >
              {sendingCrm
                ? 'Salvando no Supabase...'
                : `Enviar selecionados para o CRM (${selectedIds.length})`}
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB]"
              >
                🔄 Nova busca
              </button>
            )}
          </>
        }
      >
        {/* Search Form */}
        <form onSubmit={handleSearch} className="glass-card rounded-2xl p-5 mb-6 space-y-4">
          {/* Quick Niche Suggestions */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-2">
              Sugestões Rápidas de Nicho
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FEATURED_NICHES.map(niche => {
                const active = query.toLowerCase() === niche.toLowerCase();
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => setQuery(niche.toLowerCase())}
                    className={`px-3 py-1 rounded-xl text-[11.5px] font-semibold border transition-all ${
                      active
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[--bg-card] text-[--text-3] border-[--border] hover:border-[#2563EB]'
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 pt-2 border-t border-[--border-dim]">
            {/* 1. Query (Tipo de Negócio) */}
            <div className="lg:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1.5">
                Tipo de Negócio (Query)
              </label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Ex: restaurante, barbearia, clinica odontologica...'
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-medium"
              />
            </div>

            {/* 2. Location (Cidade ou Região) */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1.5">
                Cidade ou Região (Location)
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder='Ex: Barreiras, BA ou Pinheiros, São Paulo, SP'
                maxLength={120}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-medium"
              />
            </div>

            {/* 3. Limit (10, 20 ou 40) */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[--text-4] mb-1.5">
                Limite
              </label>
              <select
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[13.5px] font-bold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={40}>40</option>
              </select>
            </div>

            {/* 4. Submit Button */}
            <div className="lg:col-span-2 flex flex-col justify-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-[13.5px] shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
                style={{ background: '#2563EB' }}
              >
                {searching ? '⏳ Buscando...' : '🔍 Buscar leads'}
              </button>
            </div>
          </div>

          {/* Quick Filters Bar */}
          {results.length > 0 && (
            <div className="pt-3 border-t border-[--border-dim] flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[--text-4] mr-1">Filtro rápido:</span>
              {(
                [
                  ['todos', `Todos (${results.length})`],
                  ['sem_site', `🔴 Sem site (${countSemSite})`],
                  ['com_site', `🟢 Com site (${countComSite})`],
                  ['bem_avaliados', `⭐ Bem avaliados 4.5+ (${countBemAvaliados})`],
                ] as [QuickFilter, string][]
              ).map(([qf, label]) => (
                <button
                  key={qf}
                  type="button"
                  onClick={() => setQuickFilter(qf)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    quickFilter === qf
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[--bg-card] text-[--text-3] border-[--border] hover:border-[#2563EB]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-between gap-3">
            <span>⚠️ {errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="px-2 py-1 rounded-lg border border-red-500/30"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {searching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 border border-[--border] animate-pulse space-y-3"
              >
                <div className="h-5 w-2/3 bg-[--bg-2] rounded-lg" />
                <div className="h-3.5 w-1/3 bg-[--bg-2] rounded-lg" />
                <div className="h-3.5 w-full bg-[--bg-2] rounded-lg" />
                <div className="h-9 w-full bg-[--bg-2] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State before first search */}
        {!searching && !hasSearched && results.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto my-4 border border-[--border]">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-extrabold text-[--text]">
              Pronto para encontrar negócios locais no Google Maps
            </h3>
            <p className="text-xs text-[--text-3] mt-2 leading-relaxed">
              1. Digite o <strong>tipo de negócio</strong> acima (ex: <em>restaurante</em>,{' '}
              <em>barbearia</em>, <em>clínica odontológica</em>).
              <br />
              2. Informe a <strong>cidade e estado</strong> (ex: <em>Barreiras, BA</em>).
              <br />
              3. Clique em <strong>&ldquo;Buscar leads&rdquo;</strong> para consultar a Google
              Places API em tempo real, identificar quem ainda não possui site e gerar páginas
              profissionais em 1 clique.
            </p>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="mt-5 px-6 py-3 rounded-xl text-white font-extrabold text-xs shadow-lg"
              style={{ background: '#2563EB' }}
            >
              🔍 Buscar &ldquo;{query || 'restaurante'}&rdquo; em &ldquo;
              {location || 'Barreiras, BA'}&rdquo; agora
            </button>
          </div>
        )}

        {/* Empty State when filter returns 0 */}
        {!searching && hasSearched && filteredResults.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <h3 className="text-base font-bold text-[--text]">
              Nenhum negócio encontrado para este filtro
            </h3>
            <p className="text-xs text-[--text-4] mt-1">
              Altere o filtro rápido acima ou faça uma nova busca com outra cidade/categoria.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!searching && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResults.map(lead => {
              const isSelected = selectedIds.includes(lead.id);
              const cleanPhone = (lead.telefone || '').replace(/\D/g, '');

              return (
                <div
                  key={lead.id}
                  className={`glass-card rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                    isSelected
                      ? 'ring-2 ring-[#2563EB] border-[#2563EB]'
                      : !lead.tem_site
                      ? 'border-red-500/30'
                      : 'border-[--border]'
                  }`}
                >
                  <div>
                    {/* Header: Checkbox, Name, Category & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="mt-1 accent-[#2563EB]"
                        />
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-extrabold text-[--text] leading-snug truncate">
                            {lead.nome}
                          </h3>
                          {lead.categoria && (
                            <p className="text-[11.5px] text-[--text-4] mt-0.5 truncate">
                              {lead.categoria}
                            </p>
                          )}
                        </div>
                      </label>

                      {/* Badge Verde "Tem site" / Badge Vermelho "Sem site" */}
                      <span
                        className="text-[10.5px] font-extrabold px-2.5 py-1 rounded-full shrink-0"
                        style={
                          lead.tem_site
                            ? {
                                color: '#10B981',
                                background: 'rgba(16, 185, 129, 0.16)',
                              }
                            : {
                                color: '#EF4444',
                                background: 'rgba(239, 68, 68, 0.18)',
                              }
                        }
                      >
                        {lead.tem_site ? '● Tem site' : '● Sem site'}
                      </span>
                    </div>

                    {/* CRM Status Badge if already sent */}
                    {lead.inCrm && (
                      <div className="mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                          {lead.isDuplicate
                            ? '✓ Já existia no CRM (Duplicado ignorado)'
                            : '✓ Salvo no CRM (Supabase)'}
                        </span>
                      </div>
                    )}

                    {/* Business Details */}
                    <div className="mt-3.5 space-y-1.5 text-[12px] text-[--text-3]">
                      <div className="line-clamp-2" title={lead.endereco}>
                        📍 {lead.endereco || 'Endereço não informado'}
                      </div>

                      <div>
                        📞{' '}
                        {lead.telefone ? (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="font-semibold text-[--text] hover:underline"
                          >
                            {lead.telefone}
                          </a>
                        ) : (
                          <span className="text-[--text-4]">Sem telefone listado</span>
                        )}
                      </div>

                      <div>
                        ⭐{' '}
                        <strong>
                          {lead.nota > 0 ? lead.nota.toFixed(1) : 'S/N'}
                        </strong>{' '}
                        ({lead.avaliacoes} avaliações no Google)
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        {lead.tem_site && lead.site ? (
                          <a
                            href={lead.site}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#10B981] font-semibold hover:underline truncate max-w-[180px]"
                            title={lead.site}
                          >
                            🌐 Abrir site atual ↗
                          </a>
                        ) : (
                          <span className="text-red-400 font-semibold text-[11.5px]">
                            🚀 Oportunidade: Sem site
                          </span>
                        )}

                        {lead.google_maps_url && (
                          <a
                            href={lead.google_maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#3B82F6] font-bold hover:underline shrink-0"
                          >
                            🗺️ Google Maps ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Gerar site, Enviar para CRM, Ver detalhes */}
                  <div className="mt-4 pt-3.5 border-t border-[--border-dim] flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateSiteForLead(lead)}
                      disabled={generatingId === lead.id}
                      className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-[12px] transition-all ${
                        !lead.tem_site
                          ? 'text-white shadow-md hover:opacity-95'
                          : 'border border-[#2563EB] text-[#3B82F6] hover:bg-[#2563EB]/10'
                      }`}
                      style={!lead.tem_site ? { background: '#2563EB' } : undefined}
                    >
                      {generatingId === lead.id
                        ? 'Gerando...'
                        : !lead.tem_site
                        ? '✨ Gerar site'
                        : '🎨 Propor site melhor'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendLeadsToCrm([lead])}
                      disabled={sendingCrm || lead.inCrm}
                      className="py-2 px-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[11.5px] font-bold hover:border-[#10B981] disabled:opacity-50"
                    >
                      {lead.inCrm ? '✓ No CRM' : '+ Enviar p/ CRM'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetailLead(lead)}
                      className="py-2 px-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[11.5px] font-semibold hover:border-[#2563EB]"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Ver Detalhes do Lead */}
        {detailLead && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-[--border] shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full"
                    style={
                      detailLead.tem_site
                        ? { color: '#10B981', background: 'rgba(16,185,129,0.16)' }
                        : { color: '#EF4444', background: 'rgba(239,68,68,0.18)' }
                    }
                  >
                    {detailLead.tem_site ? '● Tem site' : '● Sem site'}
                  </span>
                  <h2 className="text-lg font-extrabold text-[--text] mt-2">
                    {detailLead.nome}
                  </h2>
                  <p className="text-xs text-[--text-4]">{detailLead.categoria}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailLead(null)}
                  className="px-2.5 py-1 rounded-lg border border-[--border] text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs bg-[--bg-2] p-4 rounded-xl">
                <div>
                  <span className="text-[--text-4] block">Endereço Completo:</span>
                  <strong className="text-[--text]">{detailLead.endereco}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[--text-4] block">Telefone:</span>
                    <strong className="text-[--text]">
                      {detailLead.telefone || 'Não informado'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[--text-4] block">Avaliação Google:</span>
                    <strong className="text-[--text]">
                      ⭐ {detailLead.nota} ({detailLead.avaliacoes} avaliações)
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="text-[--text-4] block">Website Atual:</span>
                  {detailLead.site ? (
                    <a
                      href={detailLead.site}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#10B981] font-bold hover:underline break-all"
                    >
                      {detailLead.site}
                    </a>
                  ) : (
                    <strong className="text-red-400">Não possui site</strong>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[--text-4] block">Latitude / Longitude:</span>
                    <strong className="text-[--text]">
                      {detailLead.latitude.toFixed(5)}, {detailLead.longitude.toFixed(5)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[--text-4] block">Ficha Google Maps:</span>
                    {detailLead.google_maps_url ? (
                      <a
                        href={detailLead.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3B82F6] font-bold hover:underline"
                      >
                        Abrir no Google Maps ↗
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailLead;
                    setDetailLead(null);
                    handleGenerateSiteForLead(target);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs"
                >
                  ✨ Gerar Site para este Negócio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendLeadsToCrm([detailLead]);
                    setDetailLead(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#10B981] text-white font-extrabold text-xs"
                >
                  + Enviar para CRM
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default LeadsPage;
