import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import {
  CRM_STAGE_COLORS,
  CRM_STAGES,
  CrmStage,
  LEAD_TIER_STYLES,
  LOSS_REASONS,
} from '../../utils/leadsiteConstants';
import {
  AppointmentItem,
  GeneratedSite,
  LeadItem,
  loadAppointments,
  loadLeads,
  loadQuota,
  loadSites,
  saveAppointments,
  saveLeads,
  saveQuota,
} from '../../utils/leadsiteStore';
import type { ScriptKind } from '../api/crm/scripts';

const CrmPage: NextPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState<'kanban' | 'appointments'>('kanban');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  // Active lead drawer for AI Scripts & Scheduling
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null);
  const [scriptKind, setScriptKind] = useState<ScriptKind>('whatsapp');
  const [scriptContent, setScriptContent] = useState('');
  const [loadingScript, setLoadingScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Schedule form inside lead drawer
  const [aptDate, setAptDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [aptTime, setAptTime] = useState('15:00');
  const [aptType, setAptType] = useState<AppointmentItem['type']>('Vídeo-chamada (Mostrar Site)');
  const [aptNotes, setAptNotes] = useState('');

  useEffect(() => {
    const loadedLeads = loadLeads();
    setLeads(loadedLeads);
    setSites(loadSites());
    setAppointments(loadAppointments());

    if (router.query.tab === 'appointments') {
      setTab('appointments');
    }
    if (typeof router.query.leadId === 'string') {
      const found = loadedLeads.find(l => l.id === router.query.leadId);
      if (found) {
        setActiveLead(found);
      }
    }
  }, [router.query.tab, router.query.leadId]);

  useEffect(() => {
    if (activeLead) {
      generateScript(activeLead, scriptKind);
    }
  }, [activeLead, scriptKind]);

  const generateScript = async (lead: LeadItem, kind: ScriptKind) => {
    setLoadingScript(true);
    try {
      const linkedSite = sites.find(s => s.leadId === lead.id || s.id === lead.siteId);
      const siteUrl = linkedSite
        ? `${window.location.origin}/s/${linkedSite.slug}`
        : undefined;

      const res = await fetch('/api/crm/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, kind, siteUrl }),
      });
      const data = await res.json();
      if (data?.script) {
        setScriptContent(data.script);
        const q = loadQuota();
        saveQuota({ ...q, scriptsUsed: q.scriptsUsed + 1 });
        window.dispatchEvent(new Event('leadsite-quota-updated'));
      }
    } catch {
      setScriptContent('Erro ao gerar script.');
    } finally {
      setLoadingScript(false);
    }
  };

  const handleMoveStage = (leadId: string, newStage: CrmStage, lossReason?: string) => {
    const updated = leads.map(l =>
      l.id === leadId
        ? { ...l, stage: newStage, inCrm: true, lossReason: lossReason ?? l.lossReason }
        : l
    );
    setLeads(updated);
    saveLeads(updated);
    if (activeLead?.id === leadId) {
      setActiveLead(updated.find(l => l.id === leadId) || null);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    const newApt: AppointmentItem = {
      id: `apt-${Date.now()}`,
      leadId: activeLead.id,
      leadName: activeLead.name,
      category: `${activeLead.category} · ${activeLead.city}`,
      phone: activeLead.phone,
      date: aptDate,
      time: aptTime,
      type: aptType,
      notes: aptNotes || 'Apresentar o site gerado e fechar proposta.',
      completed: false,
    };
    const nextApts = [newApt, ...appointments];
    setAppointments(nextApts);
    saveAppointments(nextApts);
    handleMoveStage(activeLead.id, 'Agendado');
    setAptNotes('');
    alert('Agendamento salvo e lead movido para a coluna Agendado!');
  };

  const toggleAppointmentComplete = (id: string) => {
    const next = appointments.map(a => (a.id === id ? { ...a, completed: !a.completed } : a));
    setAppointments(next);
    saveAppointments(next);
  };

  const crmLeads = leads.filter(l => l.inCrm);

  return (
    <>
      <Head>
        <title>CRM & Agendamentos — LeadSite</title>
      </Head>

      <AppLayout
        title="CRM Visual & Gerador de Scripts IA"
        subtitle="Arraste os leads pelas etapas do funil, gere scripts de WhatsApp, Ligação, Reunião e Quebra de Objeções e organize seus Agendamentos."
        actions={
          <div className="inline-flex items-center gap-1 p-1 rounded-xl glass-btn border border-[--border]">
            <button
              onClick={() => setTab('kanban')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                tab === 'kanban' ? 'text-white' : 'text-[--text-3]'
              }`}
              style={tab === 'kanban' ? { background: '#0071E3' } : undefined}
            >
              📋 Funil Kanban ({crmLeads.length})
            </button>
            <button
              onClick={() => setTab('appointments')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                tab === 'appointments' ? 'text-white' : 'text-[--text-3]'
              }`}
              style={tab === 'appointments' ? { background: '#0071E3' } : undefined}
            >
              📅 Agendamentos ({appointments.filter(a => !a.completed).length})
            </button>
          </div>
        }
      >
        {tab === 'kanban' ? (
          <div className="space-y-6">
            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
              {CRM_STAGES.map(stage => {
                const colLeads = crmLeads.filter(l => l.stage === stage);
                const color = CRM_STAGE_COLORS[stage];

                return (
                  <div
                    key={stage}
                    className="glass-card rounded-2xl p-3.5 border-t-4 flex flex-col gap-3 min-h-[420px]"
                    style={{ borderTopColor: color }}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[13px] font-extrabold text-[--text]">{stage}</span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: color }}
                      >
                        {colLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {colLeads.map(lead => {
                        const tStyle = LEAD_TIER_STYLES[lead.tier];
                        const isSelected = activeLead?.id === lead.id;

                        return (
                          <div
                            key={lead.id}
                            onClick={() => setActiveLead(lead)}
                            className={`p-3 rounded-xl border bg-[--bg-card] cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'ring-2 ring-[#0071E3] border-[#0071E3]' : 'border-[--border-dim]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="text-[13px] font-bold text-[--text] leading-snug">
                                {lead.name}
                              </span>
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ color: tStyle.color, background: tStyle.bg }}
                              >
                                {lead.score}
                              </span>
                            </div>

                            <div className="text-[11px] text-[--text-4] mt-1">
                              {lead.category} · {lead.city}
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {lead.flags.map(f => (
                                <span
                                  key={f}
                                  className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ color: '#D92D20', background: '#FFF5F4' }}
                                >
                                  {f}
                                </span>
                              ))}
                            </div>

                            {lead.stage === 'Perdido' && lead.lossReason && (
                              <div className="mt-2 text-[10.5px] text-[#D92D20] bg-[#FFF5F4] px-2 py-1 rounded">
                                Motivo: {lead.lossReason}
                              </div>
                            )}

                            <div
                              className="mt-3 pt-2 border-t border-[--border-dim] flex items-center justify-between gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <select
                                value={lead.stage}
                                onChange={e =>
                                  handleMoveStage(lead.id, e.target.value as CrmStage)
                                }
                                className="text-[10.5px] font-semibold px-1.5 py-1 rounded border border-[--border] bg-[--bg-2] max-w-[110px]"
                              >
                                {CRM_STAGES.map(s => (
                                  <option key={s} value={s}>
                                    → {s}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => setActiveLead(lead)}
                                className="text-[10.5px] font-bold text-[#0071E3] hover:underline"
                              >
                                Scripts IA →
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {colLeads.length === 0 && (
                        <div className="text-center py-8 text-[11.5px] text-[--text-4]">
                          Nenhum lead nesta etapa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Lead Script & Action Panel */}
            {activeLead && (
              <div className="glass-card rounded-2xl p-6 border-2 border-[#0071E3]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--border-dim]">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[18px] font-extrabold text-[--text]">
                        {activeLead.name}
                      </h2>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                        style={{ background: CRM_STAGE_COLORS[activeLead.stage] }}
                      >
                        {activeLead.stage}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[--text-3] mt-0.5">
                      📍 {activeLead.address} · 📞 +{activeLead.phone} · ⭐ {activeLead.rating} (
                      {activeLead.reviewsCount} avaliações)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/studio${activeLead.siteId ? `?siteId=${activeLead.siteId}` : ''}`}
                      className="text-[12px] font-bold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
                    >
                      🎨 Abrir Site no Editor
                    </Link>
                    <button
                      onClick={() => setActiveLead(null)}
                      className="text-[12px] px-3 py-2 rounded-xl border border-[--border] text-[--text-4]"
                    >
                      ✕ Fechar
                    </button>
                  </div>
                </div>

                {/* Loss Reason selector if stage === Perdido */}
                {activeLead.stage === 'Perdido' && (
                  <div className="mt-4 p-3 rounded-xl bg-[#FFF5F4] border border-red-200 flex items-center gap-3 flex-wrap">
                    <span className="text-[12px] font-bold text-[#D92D20]">
                      Motivo da perda:
                    </span>
                    <select
                      value={activeLead.lossReason || LOSS_REASONS[0]}
                      onChange={e => handleMoveStage(activeLead.id, 'Perdido', e.target.value)}
                      className="text-[12px] px-3 py-1.5 rounded-lg border border-red-300 bg-white text-gray-900"
                    >
                      {LOSS_REASONS.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mt-5">
                  {/* Left: 4 Sales Scripts Generator */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {[
                        { id: 'whatsapp' as const, label: '💬 Mensagem WhatsApp' },
                        { id: 'call' as const, label: '📞 Roteiro de Ligação' },
                        { id: 'meeting' as const, label: '💻 Roteiro da Reunião' },
                        { id: 'objection' as const, label: '🛡️ Quebrar Objeção' },
                      ].map(tabItem => (
                        <button
                          key={tabItem.id}
                          onClick={() => setScriptKind(tabItem.id)}
                          className={`text-[12px] font-bold px-3.5 py-2 rounded-xl transition-all ${
                            scriptKind === tabItem.id
                              ? 'text-white shadow-sm'
                              : 'border border-[--border] bg-[--bg-card] text-[--text-3]'
                          }`}
                          style={
                            scriptKind === tabItem.id ? { background: '#0071E3' } : undefined
                          }
                        >
                          {tabItem.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <textarea
                        rows={10}
                        value={loadingScript ? 'Gerando roteiro personalizado com IA...' : scriptContent}
                        onChange={e => setScriptContent(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[--border] bg-[--bg-2] text-[13px] leading-relaxed font-sans"
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scriptContent).catch(() => {});
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-[12.5px] font-bold px-4 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
                      >
                        {copiedScript ? '✓ Copiado!' : '📋 Copiar Roteiro'}
                      </button>

                      <a
                        href={`https://wa.me/${activeLead.phone}?text=${encodeURIComponent(scriptContent)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (activeLead.stage === 'Base') {
                            handleMoveStage(activeLead.id, 'Abordado');
                          }
                        }}
                        className="text-[12.5px] font-bold px-5 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                        style={{ background: '#1FA855' }}
                      >
                        📲 Enviar no WhatsApp de {activeLead.name} →
                      </a>
                    </div>
                  </div>

                  {/* Right: Schedule Appointment Box */}
                  <div className="bg-[--bg-2] border border-[--border-dim] rounded-2xl p-5">
                    <h3 className="text-[14.5px] font-bold text-[--text] mb-1">
                      📅 Marcar Novo Agendamento
                    </h3>
                    <p className="text-[12px] text-[--text-4] mb-4">
                      Agende a vídeo-chamada para espelhar a tela e mostrar o site pronto.
                    </p>

                    <form onSubmit={handleCreateAppointment} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-[--text-4] mb-1">
                            Data
                          </label>
                          <input
                            type="date"
                            required
                            value={aptDate}
                            onChange={e => setAptDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[--text-4] mb-1">
                            Horário
                          </label>
                          <input
                            type="time"
                            required
                            value={aptTime}
                            onChange={e => setAptTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[--text-4] mb-1">
                          Tipo de compromisso
                        </label>
                        <select
                          value={aptType}
                          onChange={e => setAptType(e.target.value as AppointmentItem['type'])}
                          className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px]"
                        >
                          <option value="Vídeo-chamada (Mostrar Site)">
                            Vídeo-chamada (Mostrar Site)
                          </option>
                          <option value="Ligação de Abordagem">Ligação de Abordagem</option>
                          <option value="Follow-up de Fechamento">Follow-up de Fechamento</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[--text-4] mb-1">
                          Observações
                        </label>
                        <textarea
                          rows={2}
                          value={aptNotes}
                          onChange={e => setAptNotes(e.target.value)}
                          placeholder="Ex: Mostrar site com botão verde e oferecer plano R$ 800 + R$ 120/mês"
                          className="w-full p-2.5 rounded-xl border border-[--border] bg-[--bg-card] text-[12.5px]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl text-white font-bold text-[13px]"
                        style={{ background: '#0071E3' }}
                      >
                        Salvar Agendamento
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Appointments Tab */
          <div className="space-y-4">
            {appointments.map(apt => (
              <div
                key={apt.id}
                className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  apt.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: apt.completed ? '#8E8E93' : '#0071E3' }}
                    >
                      {apt.date} às {apt.time}
                    </span>
                    <span className="text-[12px] font-semibold text-[#1A7E3A]">{apt.type}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[--text]">{apt.leadName}</h3>
                  <p className="text-[12.5px] text-[--text-3]">{apt.notes}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/${apt.phone}?text=${encodeURIComponent(
                      `Olá! Confirmando nossa conversa sobre o site da ${apt.leadName} agendada para ${apt.date} às ${apt.time}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-bold px-3.5 py-2 rounded-xl text-white"
                    style={{ background: '#1FA855' }}
                  >
                    💬 Lembrar no WhatsApp
                  </a>
                  <button
                    onClick={() => toggleAppointmentComplete(apt.id)}
                    className="text-[12px] font-semibold px-3.5 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  >
                    {apt.completed ? 'Reabrir' : '✓ Concluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default CrmPage;
