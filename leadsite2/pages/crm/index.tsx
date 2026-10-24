import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout, showToast } from '../../components/AppLayout';
import {
  COMMON_OBJECTIONS,
  CRM_STAGE_COLORS,
  CRM_STAGES,
  CrmStage,
  LOSS_REASONS,
} from '../../utils/leadsiteConstants';
import {
  GeneratedSite,
  LeadActivity,
  LeadItem,
  loadLeads,
  loadSites,
  saveLeads,
} from '../../utils/leadsiteStore';

type ScriptType =
  | 'whatsapp_inicial'
  | 'whatsapp_followup'
  | 'ligacao'
  | 'reuniao'
  | 'objecao';

const CrmPage: NextPage = () => {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Selected Lead for Details / Scripts Drawer
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [activeDrawerTab, setActiveDrawerTab] = useState<'details' | 'scripts'>('details');

  // Scripts generator state
  const [scriptType, setScriptType] = useState<ScriptType>('whatsapp_inicial');
  const [objectionKey, setObjectionKey] = useState<string>('esta_caro');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [loadingScript, setLoadingScript] = useState(false);

  // Activity form state
  const [activityType, setActivityType] = useState<LeadActivity['type']>('nota');
  const [activityText, setActivityText] = useState('');

  // Loss Reason Modal
  const [lossModalLeadId, setLossModalLeadId] = useState<string | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0]);

  useEffect(() => {
    const l = loadLeads();
    const s = loadSites();
    setLeads(l);
    setSites(s);

    const qId = typeof router.query.leadId === 'string' ? router.query.leadId : '';
    if (qId && l.some(item => item.id === qId)) {
      setSelectedLeadId(qId);
    }

    // Sync leads saved in Supabase table `leads`
    fetch('/api/leads/create')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!Array.isArray(data?.leads) || data.leads.length === 0) return;
        const current = loadLeads();
        const existingNames = new Set(current.map(item => item.name.toLowerCase().trim()));
        const fromDb: LeadItem[] = [];
        for (const row of data.leads) {
          const name = String(row.name || '').trim();
          if (!name || existingNames.has(name.toLowerCase())) continue;
          existingNames.add(name.toLowerCase());
          const cf = row.custom_fields || {};
          const addr = String(cf.endereco || '');
          const temSite = Boolean(cf.tem_site || cf.site);
          fromDb.push({
            id: String(row.id || `sb-${Date.now()}`),
            name,
            category: String(cf.categoria || 'Negócio Local'),
            state: 'BR',
            city: addr.split(',')[1]?.trim() || 'Local',
            address: addr,
            phone: String(row.phone || ''),
            whatsapp: String(row.phone || '').replace(/\D/g, ''),
            website: String(cf.site || ''),
            googleMapsUrl: String(cf.google_maps_url || ''),
            rating: Number(cf.nota || 4.8),
            reviewsCount: Number(cf.avaliacoes || 0),
            score: temSite ? 72 : 95,
            tier: temSite ? 'morno' : 'quente',
            flags: temSite ? ['Site desatualizado'] : ['Sem site'],
            stage: 'Novo lead',
            inCrm: true,
            estimatedValue: 1500,
            source: String(cf.origem || 'google_maps'),
            createdAt: row.created_at || new Date().toISOString(),
          });
        }
        if (fromDb.length > 0) {
          const merged = [...fromDb, ...current];
          setLeads(merged);
          saveLeads(merged);
        }
      })
      .catch(() => {});
  }, [router.query.leadId]);

  const crmLeads = leads.filter(l => l.inCrm);
  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;
  const selectedLeadSite = selectedLead
    ? sites.find(s => s.leadId === selectedLead.id || s.id === selectedLead.siteId)
    : undefined;

  const updateLead = (id: string, patch: Partial<LeadItem>, logText?: string) => {
    const updated = leads.map(l => {
      if (l.id !== id) return l;
      const nextActivities = logText
        ? [
            {
              id: `act-${Date.now()}`,
              type: 'status' as const,
              description: logText,
              createdAt: new Date().toISOString(),
            },
            ...(l.activities || []),
          ]
        : l.activities || [];
      return {
        ...l,
        ...patch,
        activities: nextActivities,
        updatedAt: new Date().toISOString(),
      };
    });
    setLeads(updated);
    saveLeads(updated);
  };

  const handleStageChange = (leadId: string, nextStage: CrmStage) => {
    if (nextStage === 'Perdido') {
      setLossModalLeadId(leadId);
      return;
    }
    updateLead(leadId, { stage: nextStage }, `Etapa alterada para "${nextStage}"`);
    showToast(`Lead movido para "${nextStage}"`, 'success');
  };

  const confirmLossStage = () => {
    if (!lossModalLeadId) return;
    updateLead(
      lossModalLeadId,
      { stage: 'Perdido', lossReason: selectedLossReason },
      `Marcado como Perdido (${selectedLossReason})`
    );
    setLossModalLeadId(null);
    showToast('Lead movido para Perdido.', 'info');
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityText.trim()) return;
    const newAct: LeadActivity = {
      id: `act-${Date.now()}`,
      type: activityType,
      description: activityText.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextActivities = [newAct, ...(selectedLead.activities || [])];
    updateLead(selectedLead.id, { activities: nextActivities });
    setActivityText('');
    showToast('Interação registrada no histórico do lead!', 'success');
  };

  const handleGenerateScript = async (
    lead: LeadItem,
    typeOverride?: ScriptType,
    objOverride?: string
  ) => {
    const targetType = typeOverride || scriptType;
    const targetObj = objOverride || objectionKey;
    setLoadingScript(true);
    try {
      const site = sites.find(s => s.leadId === lead.id || s.id === lead.siteId);
      const publicUrl = site
        ? `${window.location.origin}/site/${site.slug}`
        : `${window.location.origin}/site/${lead.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')}`;

      const res = await fetch('/api/crm/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: targetType,
          objectionKey: targetObj,
          leadName: lead.name,
          category: lead.category,
          city: lead.city,
          state: lead.state,
          rating: lead.rating,
          reviewsCount: lead.reviewsCount,
          ownerName: lead.ownerName,
          flags: lead.flags,
          publicUrl,
        }),
      });
      const data = await res.json();
      if (data?.script) {
        setGeneratedScript(data.script);
      }
    } catch {
      showToast('Erro ao gerar script com IA.', 'error');
    } finally {
      setLoadingScript(false);
    }
  };

  const totalPipelineValue = crmLeads
    .filter(l => l.stage !== 'Perdido')
    .reduce((acc, item) => acc + (item.estimatedValue || 1500), 0);

  const closedValue = crmLeads
    .filter(l => l.stage === 'Fechado')
    .reduce((acc, item) => acc + (item.estimatedValue || 1500), 0);

  return (
    <>
      <Head>
        <title>CRM Comercial — BlackDev Leads</title>
      </Head>

      <AppLayout
        title="CRM Comercial & Scripts de Vendas IA"
        subtitle={`Arraste os leads entre as 7 etapas do funil · Pipeline ativo: R$ ${totalPipelineValue.toLocaleString(
          'pt-BR'
        )} · Fechado: R$ ${closedValue.toLocaleString('pt-BR')}`}
        actions={
          <>
            <Link
              href="/leads"
              className="text-[12.5px] font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#2563EB' }}
            >
              + Buscar Mais Leads
            </Link>
            <Link
              href="/compromissos"
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#2563EB]"
            >
              📅 Ver Compromissos
            </Link>
          </>
        }
      >
        {/* 7-Column Drag & Drop Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-5">
          {CRM_STAGES.map(stage => {
            const stageLeads = crmLeads.filter(l => l.stage === stage);
            const stageTotal = stageLeads.reduce(
              (acc, item) => acc + (item.estimatedValue || 1500),
              0
            );

            return (
              <div
                key={stage}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedLeadId) {
                    handleStageChange(draggedLeadId, stage);
                    setDraggedLeadId(null);
                  }
                }}
                className="w-72 shrink-0 glass-card rounded-2xl p-3.5 flex flex-col justify-between min-h-[540px] border border-[--border]"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CRM_STAGE_COLORS[stage] }}
                      />
                      <h3 className="text-[13px] font-extrabold text-[--text]">{stage}</h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[--bg-2] text-[--text-3]">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-[--text-4] px-1 mb-3">
                    R$ {stageTotal.toLocaleString('pt-BR')}
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {stageLeads.map(lead => {
                      const site = sites.find(
                        s => s.leadId === lead.id || s.id === lead.siteId
                      );
                      const cleanPhone = (lead.whatsapp || lead.phone).replace(/\D/g, '');

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => setDraggedLeadId(lead.id)}
                          className="p-3.5 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[#2563EB] cursor-grab active:cursor-grabbing shadow-sm space-y-2.5 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setActiveDrawerTab('details');
                              }}
                              className="text-left min-w-0"
                            >
                              <div className="text-[13.5px] font-extrabold text-[--text] hover:text-[#3B82F6] truncate">
                                {lead.name}
                              </div>
                              <div className="text-[11px] text-[--text-4]">
                                {lead.category} · {lead.city}/{lead.state}
                              </div>
                            </button>
                            <span className="text-[11px] font-extrabold text-[#10B981] shrink-0">
                              R$ {(lead.estimatedValue || 1500).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap">
                            {lead.flags.map(flag => (
                              <span
                                key={flag}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400"
                              >
                                {flag}
                              </span>
                            ))}
                            {site && (
                              <Link
                                href={`/site/${site.slug}`}
                                target="_blank"
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 hover:underline"
                              >
                                🌐 /site/{site.slug} ↗
                              </Link>
                            )}
                          </div>

                          {lead.lossReason && stage === 'Perdido' && (
                            <div className="text-[10.5px] text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                              Motivo: {lead.lossReason}
                            </div>
                          )}

                          {/* Quick Card Buttons */}
                          <div className="pt-2 border-t border-[--border-dim] flex items-center justify-between gap-1.5 text-[11px]">
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] font-bold"
                              title="Abrir conversa no WhatsApp"
                            >
                              💬 Whats
                            </a>
                            <a
                              href={`tel:+${cleanPhone}`}
                              className="px-2 py-1 rounded-lg border border-[--border] font-semibold"
                              title="Ligar"
                            >
                              📞 Ligar
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setActiveDrawerTab('scripts');
                                handleGenerateScript(lead, 'whatsapp_inicial');
                              }}
                              className="px-2 py-1 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] font-bold"
                            >
                              🤖 Script IA
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setActiveDrawerTab('details');
                              }}
                              className="px-2 py-1 rounded-lg border border-[--border] font-semibold"
                            >
                              Abrir
                            </button>
                          </div>

                          {/* Stage Selector Fallback */}
                          <select
                            value={lead.stage}
                            onChange={e =>
                              handleStageChange(lead.id, e.target.value as CrmStage)
                            }
                            className="w-full px-2 py-1 rounded-lg border border-[--border] bg-[--bg] text-[11px] font-semibold"
                          >
                            {CRM_STAGES.map(st => (
                              <option key={st} value={st}>
                                Mover p/ {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Details + AI Sales Scripts Modal / Drawer */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl max-w-4xl w-full p-6 border border-[--border] shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--border-dim]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B82F6]">
                      {selectedLead.category} · {selectedLead.city}/{selectedLead.state}
                    </span>
                    <span
                      className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: CRM_STAGE_COLORS[selectedLead.stage] }}
                    >
                      {selectedLead.stage}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[--text] mt-1">
                    {selectedLead.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('details')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                      activeDrawerTab === 'details'
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-[--border]'
                    }`}
                  >
                    📋 Detalhes & Histórico
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDrawerTab('scripts');
                      if (!generatedScript) {
                        handleGenerateScript(selectedLead, 'whatsapp_inicial');
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                      activeDrawerTab === 'scripts'
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-[--border]'
                    }`}
                  >
                    🤖 Scripts de Vendas com IA
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLeadId('')}
                    className="px-3 py-1.5 rounded-xl border border-[--border] text-xs font-bold"
                  >
                    ✕ Fechar
                  </button>
                </div>
              </div>

              {/* TAB 1: Detalhes, Valor do Contrato, Notas e Histórico de Interações */}
              {activeDrawerTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[--bg-2]">
                      <div>
                        <label className="text-[--text-4] block mb-1">Etapa no Funil</label>
                        <select
                          value={selectedLead.stage}
                          onChange={e =>
                            handleStageChange(
                              selectedLead.id,
                              e.target.value as CrmStage
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg-card] font-bold"
                        >
                          {CRM_STAGES.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[--text-4] block mb-1">
                          Valor Estimado do Contrato (R$)
                        </label>
                        <input
                          type="number"
                          value={selectedLead.estimatedValue || 1500}
                          onChange={e =>
                            updateLead(selectedLead.id, {
                              estimatedValue: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg-card] font-bold text-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="text-[--text-4] block mb-1">Origem do Lead</label>
                        <input
                          type="text"
                          value={selectedLead.source || 'Google Maps'}
                          onChange={e =>
                            updateLead(selectedLead.id, { source: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg-card]"
                        />
                      </div>

                      <div>
                        <label className="text-[--text-4] block mb-1">Responsável / Dono</label>
                        <input
                          type="text"
                          value={selectedLead.ownerName || ''}
                          onChange={e =>
                            updateLead(selectedLead.id, { ownerName: e.target.value })
                          }
                          placeholder="Nome do decisor..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--bg-card]"
                        />
                      </div>
                    </div>

                    {/* Notas Internas */}
                    <div>
                      <label className="font-bold block mb-1 text-[--text-3]">
                        Notas Internas do Lead
                      </label>
                      <textarea
                        rows={3}
                        value={selectedLead.notes || ''}
                        onChange={e =>
                          updateLead(selectedLead.id, { notes: e.target.value })
                        }
                        placeholder="Anote detalhes da negociação, preferências do cliente, horários..."
                        className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                      />
                    </div>

                    {/* Links e Ações Diretas */}
                    <div className="p-4 rounded-xl border border-[--border] bg-[--bg-card] space-y-2.5">
                      <div className="font-bold text-[--text-4] uppercase text-[10.5px]">
                        Site Gerado & Contato Rápido
                      </div>
                      {selectedLeadSite ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[#10B981]">
                            /site/{selectedLeadSite.slug}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/studio?siteId=${selectedLeadSite.id}`}
                              className="px-2.5 py-1 rounded-lg border border-[--border] font-bold"
                            >
                              🎨 Editar Site
                            </Link>
                            <Link
                              href={`/site/${selectedLeadSite.slug}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-lg bg-[#10B981] text-white font-bold"
                            >
                              🌐 Abrir Site ↗
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[--text-4]">Ainda sem site gerado</span>
                          <Link
                            href="/leads"
                            className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold"
                          >
                            ✨ Gerar Site em Leads →
                          </Link>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[--border-dim]">
                        <a
                          href={`https://wa.me/${(
                            selectedLead.whatsapp || selectedLead.phone
                          ).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-[#10B981] text-white font-bold"
                        >
                          💬 Conversar no WhatsApp
                        </a>
                        <a
                          href={`tel:+${selectedLead.phone.replace(/\D/g, '')}`}
                          className="px-3.5 py-2 rounded-xl border border-[--border] font-bold"
                        >
                          📞 Ligar (+{selectedLead.phone})
                        </a>
                        {selectedLead.googleMapsUrl && (
                          <a
                            href={selectedLead.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl border border-[--border] font-bold text-[#3B82F6]"
                          >
                            🗺️ Google Maps ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Histórico de Interações */}
                  <div className="lg:col-span-6 space-y-4">
                    <form
                      onSubmit={handleAddActivity}
                      className="p-4 rounded-xl border border-[--border] bg-[--bg-card] space-y-2.5"
                    >
                      <div className="font-bold text-[--text]">
                        + Registrar Nova Interação no Histórico
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={activityType}
                          onChange={e =>
                            setActivityType(e.target.value as LeadActivity['type'])
                          }
                          className="px-2.5 py-2 rounded-xl border border-[--border] bg-[--bg]"
                        >
                          <option value="nota">📝 Nota</option>
                          <option value="whatsapp">💬 WhatsApp</option>
                          <option value="ligacao">📞 Ligação</option>
                          <option value="reuniao">💻 Reunião</option>
                        </select>
                        <input
                          type="text"
                          value={activityText}
                          onChange={e => setActivityText(e.target.value)}
                          placeholder="Descreva o que foi conversado..."
                          className="flex-1 px-3 py-2 rounded-xl border border-[--border] bg-[--bg]"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white font-bold"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      <div className="font-bold text-[--text-4] uppercase text-[10.5px]">
                        Histórico de Interações ({(selectedLead.activities || []).length})
                      </div>
                      {(selectedLead.activities || []).length === 0 ? (
                        <div className="p-6 text-center text-[--text-4] border border-dashed border-[--border] rounded-xl">
                          Nenhuma interação registrada ainda.
                        </div>
                      ) : (
                        (selectedLead.activities || []).map(act => (
                          <div
                            key={act.id}
                            className="p-3 rounded-xl border border-[--border-dim] bg-[--bg-2]"
                          >
                            <div className="flex items-center justify-between text-[10.5px] text-[--text-4] mb-1">
                              <span className="font-bold uppercase text-[#3B82F6]">
                                {act.type}
                              </span>
                              <span>
                                {new Date(act.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="text-[--text]">{act.description}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Gerador de Scripts de Vendas com IA */}
              {activeDrawerTab === 'scripts' && (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['whatsapp_inicial', '💬 WhatsApp Inicial'],
                        ['whatsapp_followup', '🔄 Follow-up WhatsApp'],
                        ['ligacao', '📞 Script de Ligação'],
                        ['reuniao', '💻 Script para Reunião'],
                        ['objecao', '🛡️ Quebrar Objeções'],
                      ] as [ScriptType, string][]
                    ).map(([st, label]) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setScriptType(st);
                          handleGenerateScript(selectedLead, st, objectionKey);
                        }}
                        className={`px-3.5 py-2 rounded-xl font-bold border ${
                          scriptType === st
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-[--bg-card] border-[--border]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {scriptType === 'objecao' && (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[--bg-2]">
                      {COMMON_OBJECTIONS.map(obj => (
                        <button
                          key={obj.key}
                          type="button"
                          onClick={() => {
                            setObjectionKey(obj.key);
                            handleGenerateScript(selectedLead, 'objecao', obj.key);
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold border ${
                            objectionKey === obj.key
                              ? 'bg-[#F59E0B] text-slate-950 border-[#F59E0B]'
                              : 'bg-[--bg-card] border-[--border]'
                          }`}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      rows={11}
                      value={loadingScript ? 'Gerando script personalizado...' : generatedScript}
                      onChange={e => setGeneratedScript(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-[--border] bg-[--bg-2] font-sans text-[13px] leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedScript);
                        showToast('Script copiado para a área de transferência!', 'success');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold"
                    >
                      📋 Copiar Script
                    </button>

                    <a
                      href={`https://wa.me/${(
                        selectedLead.whatsapp || selectedLead.phone
                      ).replace(/\D/g, '')}?text=${encodeURIComponent(generatedScript)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#10B981] text-white font-bold"
                    >
                      💬 Enviar Direto no WhatsApp ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loss Reason Modal */}
        {lossModalLeadId && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-[--border] space-y-4">
              <h3 className="text-base font-extrabold text-[--text]">
                Por que este lead foi perdido?
              </h3>
              <select
                value={selectedLossReason}
                onChange={e => setSelectedLossReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-xs font-bold"
              >
                {LOSS_REASONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLossModalLeadId(null)}
                  className="px-3.5 py-2 rounded-xl border border-[--border] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmLossStage}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Confirmar Perda
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default CrmPage;
