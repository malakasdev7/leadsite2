import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { AppLayout, showToast } from '../../components/AppLayout';
import {
  AppointmentItem,
  AppointmentStatus,
  AppointmentType,
  LeadItem,
  loadAppointments,
  loadLeads,
  saveAppointments,
} from '../../utils/leadsiteStore';

type ViewFilter = 'all' | 'today' | 'week' | 'upcoming';

const TYPE_BADGES: Record<AppointmentType, { label: string; icon: string; color: string }> = {
  ligacao: { label: 'Ligação', icon: '📞', color: '#3B82F6' },
  reuniao: { label: 'Reunião', icon: '💻', color: '#8B5CF6' },
  whatsapp: { label: 'WhatsApp', icon: '💬', color: '#10B981' },
  visita: { label: 'Visita Presencial', icon: '🤝', color: '#F59E0B' },
};

const STATUS_BADGES: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  agendado: { label: 'Agendado', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  concluido: { label: 'Concluído', color: '#10B981', bg: 'rgba(16,185,129,0.16)' },
  reagendado: { label: 'Reagendado', color: '#F59E0B', bg: 'rgba(245,158,11,0.16)' },
  cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};

const CompromissosPage: NextPage = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  // New Appointment Form State
  const [title, setTitle] = useState('');
  const [leadId, setLeadId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<AppointmentType>('reuniao');
  const [status, setStatus] = useState<AppointmentStatus>('agendado');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadedApts = loadAppointments();
    const loadedLeads = loadLeads();
    setAppointments(loadedApts);
    setLeads(loadedLeads);
    if (loadedLeads.length > 0) {
      setLeadId(loadedLeads[0].id);
    }
  }, []);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const relatedLead = leads.find(l => l.id === leadId);
    const newApt: AppointmentItem = {
      id: `apt-${Date.now()}`,
      title:
        title.trim() ||
        `${TYPE_BADGES[type].label} — ${relatedLead?.name || 'Cliente'}`,
      leadId: relatedLead?.id || '',
      leadName: relatedLead?.name || 'Lead avulso',
      category: relatedLead
        ? `${relatedLead.category} · ${relatedLead.city}`
        : 'Comercial',
      phone: relatedLead?.phone || '',
      date,
      time,
      type,
      status,
      notes: notes.trim(),
      completed: status === 'concluido',
    };

    const next = [newApt, ...appointments];
    setAppointments(next);
    saveAppointments(next);
    setTitle('');
    setNotes('');
    showToast('Compromisso agendado com sucesso!', 'success');
  };

  const handleStatusChange = (id: string, nextStatus: AppointmentStatus) => {
    const next = appointments.map(a =>
      a.id === id
        ? { ...a, status: nextStatus, completed: nextStatus === 'concluido' }
        : a
    );
    setAppointments(next);
    saveAppointments(next);
    showToast(`Status atualizado para ${STATUS_BADGES[nextStatus].label}!`, 'success');
  };

  const handleDelete = (apt: AppointmentItem) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o compromisso "${apt.title || apt.leadName}"?`
      )
    ) {
      return;
    }
    const next = appointments.filter(a => a.id !== apt.id);
    setAppointments(next);
    saveAppointments(next);
    showToast('Compromisso excluído.', 'info');
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const weekAheadIso = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);

  const filteredAppointments = appointments.filter(apt => {
    if (viewFilter === 'today') return apt.date === todayIso;
    if (viewFilter === 'week')
      return apt.date >= todayIso && apt.date <= weekAheadIso;
    if (viewFilter === 'upcoming')
      return apt.date >= todayIso && apt.status !== 'cancelado';
    return true;
  });

  return (
    <>
      <Head>
        <title>Compromissos — BlackDev Leads</title>
      </Head>

      <AppLayout
        title="Agenda de Compromissos Comerciais"
        subtitle="Gerencie ligações, reuniões de apresentação de sites, follow-ups por WhatsApp e visitas presenciais."
        actions={
          <div className="flex items-center gap-1.5">
            {(
              [
                ['all', 'Todos'],
                ['today', 'Hoje'],
                ['week', 'Esta Semana'],
                ['upcoming', 'Próximos Ativos'],
              ] as [ViewFilter, string][]
            ).map(([vf, label]) => (
              <button
                key={vf}
                type="button"
                onClick={() => setViewFilter(vf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  viewFilter === vf
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-[--bg-card] border-[--border]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Criar Compromisso */}
          <form
            onSubmit={handleCreateAppointment}
            className="lg:col-span-4 glass-card rounded-2xl p-5 space-y-4 text-xs"
          >
            <h2 className="text-base font-extrabold text-[--text]">
              + Novo Compromisso
            </h2>

            <div>
              <label className="font-bold block mb-1 text-[--text-3]">
                Título do Compromisso
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Apresentar site pronto na tela..."
                className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-[--text-3]">
                Lead Relacionado
              </label>
              <select
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] font-semibold"
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.city}/{l.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1 text-[--text-3]">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-[--text-3]">Hora</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1 text-[--text-3]">Tipo</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AppointmentType)}
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] font-semibold"
                >
                  <option value="reuniao">💻 Reunião</option>
                  <option value="ligacao">📞 Ligação</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="visita">🤝 Visita</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1 text-[--text-3]">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] font-semibold"
                >
                  <option value="agendado">Agendado</option>
                  <option value="concluido">Concluído</option>
                  <option value="reagendado">Reagendado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-[--text-3]">
                Observações
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Detalhes importantes para a reunião ou ligação..."
                className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs shadow-md"
            >
              📅 Salvar Compromisso
            </button>
          </form>

          {/* Right List */}
          <div className="lg:col-span-8 space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="text-3xl mb-2">📅</div>
                <h3 className="text-base font-bold text-[--text]">
                  Nenhum compromisso neste período
                </h3>
                <p className="text-xs text-[--text-4] mt-1">
                  Use o formulário ao lado para agendar uma ligação, reunião, mensagem ou visita.
                </p>
              </div>
            ) : (
              filteredAppointments.map(apt => {
                const tBadge = TYPE_BADGES[apt.type] || TYPE_BADGES.reuniao;
                const sBadge =
                  STATUS_BADGES[apt.status] || STATUS_BADGES.agendado;
                const cleanPhone = (apt.phone || '').replace(/\D/g, '');

                return (
                  <div
                    key={apt.id}
                    className="glass-card rounded-2xl p-5 border border-[--border] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                          style={{ background: tBadge.color }}
                        >
                          {tBadge.icon} {tBadge.label}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ color: sBadge.color, background: sBadge.bg }}
                        >
                          ● {sBadge.label}
                        </span>
                        <span className="text-xs font-extrabold text-[--text-3]">
                          📅 {apt.date} às {apt.time}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[--text]">
                        {apt.title || apt.leadName}
                      </h3>

                      <div className="text-xs text-[--text-4]">
                        Lead: <strong className="text-[--text-2]">{apt.leadName}</strong> ({apt.category})
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-[--text-3] bg-[--bg-2] p-2.5 rounded-xl">
                          {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 text-xs">
                      <select
                        value={apt.status || 'agendado'}
                        onChange={e =>
                          handleStatusChange(
                            apt.id,
                            e.target.value as AppointmentStatus
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl border border-[--border] bg-[--bg-card] font-bold"
                      >
                        <option value="agendado">🟢 Agendado</option>
                        <option value="concluido">✅ Concluído</option>
                        <option value="reagendado">🟡 Reagendado</option>
                        <option value="cancelado">🔴 Cancelado</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] font-bold"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(apt)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default CompromissosPage;
