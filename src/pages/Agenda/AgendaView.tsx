import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X, Loader2, UserCheck, UserPlus, Search, ChevronRight,
  Calendar, Clock, CheckCircle2, AlertCircle, Users
} from 'lucide-react';
import { Button, cn } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';
import agendaService from '../../services/agendaService';

const mockRegisteredPatients = [
  { id: '1', name: 'João Silva', phone: '(11) 98765-4321' },
  { id: '2', name: 'Maria Souza', phone: '(11) 91234-5678' },
  { id: '3', name: 'Pedro Alves', phone: '(11) 99999-8888' },
  { id: '4', name: 'Ana Ferreira', phone: '(21) 91111-2222' },
  { id: '5', name: 'Carlos Lima', phone: '(31) 93333-4444' },
];

export interface ClinicEvent {
  id: string;
  title: string;
  patientName: string;
  dentist: string;
  start: Date | string;
  end: Date | string;
  status: 'agendado' | 'confirmado' | 'espera' | 'faltou' | 'finalizado';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  agendado: { label: 'Agendado', bg: '#14b8a6', text: '#fff', dot: 'bg-teal-500' },
  confirmado: { label: 'Confirmado', bg: '#10b981', text: '#fff', dot: 'bg-emerald-500' },
  espera: { label: 'Aguardando', bg: '#f59e0b', text: '#1c1917', dot: 'bg-amber-400' },
  faltou: { label: 'Faltou', bg: '#ef4444', text: '#fff', dot: 'bg-red-500' },
  finalizado: { label: 'Finalizado', bg: '#94a3b8', text: '#fff', dot: 'bg-slate-400' },
};

export const AgendaView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<ClinicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [showWeekends, setShowWeekends] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newEvent, setNewEvent] = useState<any>({
    patientName: '',
    patientPhone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    endTime: '11:00',
    dentist: 'Dra. Ana',
    type: '',
    value: '',
    notes: ''
  });

  const [patientStep, setPatientStep] = useState<'choose' | 'form'>('choose');
  const [patientType, setPatientType] = useState<'existing' | 'new' | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<{ id: string; name: string; phone: string } | null>(null);

  const filteredRegisteredPatients = mockRegisteredPatients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  // ── Métricas derivadas ─────────────────────────────────────────────────────
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEvents = events.filter(ev => {
    const d = typeof ev.start === 'string' ? ev.start : ev.start.toISOString();
    return d.startsWith(todayStr);
  });
  const confirmedToday = todayEvents.filter(ev => ev.status === 'confirmado').length;
  const waitingToday = todayEvents.filter(ev => ev.status === 'espera').length;

  // ── API ────────────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const dataInicio = format(start, "yyyy-MM-dd'T'HH:mm:ss");
      const dataFim = format(end, "yyyy-MM-dd'T'HH:mm:ss");
      const agendaData = await agendaService.buscarTodos(dataInicio, dataFim);
      const mappedEvents: ClinicEvent[] = agendaData.map(item => ({
        id: item.id,
        title: `${item.tipoAgendamentoDescricao || 'Consulta'} - ${item.pacienteNome}`,
        patientName: item.pacienteNome,
        dentist: item.dentistaNome,
        start: item.dataInicio,
        end: item.dataFim,
        status: item.status
      }));
      setEvents(mappedEvents);
    } catch (e) {
      console.error('Erro ao buscar agendamentos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = useCallback((dateInfo: any) => {
    fetchEvents(dateInfo.start, dateInfo.end);
  }, [fetchEvents]);

  const openNewAppointmentModal = useCallback((start: Date, end: Date) => {
    setNewEvent((prev: any) => ({
      ...prev,
      date: format(start, 'yyyy-MM-dd'),
      time: format(start, 'HH:mm'),
      endTime: format(end, 'HH:mm'),
      patientName: '', patientPhone: '', type: '', value: '', notes: ''
    }));
    setEditingEventId(null);
    setErrors({});
    setPatientStep('choose');
    setPatientType(null);
    setPatientSearch('');
    setSelectedExistingPatient(null);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback((selectInfo: any) => {
    openNewAppointmentModal(selectInfo.start, selectInfo.end);
  }, [openNewAppointmentModal]);

  const handleSelectEvent = useCallback((clickInfo: any) => {
    const event = clickInfo.event;
    const ext = event.extendedProps;
    setNewEvent({
      patientName: ext.patientName,
      patientPhone: '',
      date: format(event.start!, 'yyyy-MM-dd'),
      time: format(event.start!, 'HH:mm'),
      endTime: event.end ? format(event.end, 'HH:mm') : format(new Date(event.start!.getTime() + 3600000), 'HH:mm'),
      dentist: ext.dentist,
      type: event.title?.split(' - ')[0] || '',
      value: '',
      notes: ''
    });
    setEditingEventId(event.id);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!newEvent.patientName.trim()) errs.patientName = 'Preencha este campo.';
    if (!newEvent.patientPhone.trim()) errs.patientPhone = 'Preencha este campo.';
    if (!newEvent.date) errs.date = 'Preencha este campo.';
    if (!newEvent.time) errs.time = 'Preencha este campo.';
    if (!newEvent.endTime) errs.endTime = 'Preencha este campo.';
    if (!newEvent.type) errs.type = 'Preencha este campo.';
    if (newEvent.time && newEvent.endTime && newEvent.endTime <= newEvent.time)
      errs.endTime = 'Deve ser após a hora inicial.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setNewEvent({ ...newEvent, [field]: value });
    if (errors[field]) { const e = { ...errors }; delete e[field]; setErrors(e); }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const start = new Date(`${newEvent.date}T${newEvent.time}:00`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}:00`);
    if (editingEventId) {
      setEvents(prev => prev.map(ev => ev.id === editingEventId
        ? { ...ev, title: `${newEvent.type || 'Consulta'} - ${newEvent.patientName}`, patientName: newEvent.patientName, dentist: newEvent.dentist, start, end }
        : ev));
    } else {
      setEvents([...events, {
        id: Date.now().toString(),
        title: `${newEvent.type || 'Consulta'} - ${newEvent.patientName}`,
        patientName: newEvent.patientName,
        dentist: newEvent.dentist,
        start, end,
        status: 'agendado'
      }]);
    }
    setIsModalOpen(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = () => {
    if (editingEventId) {
      setEvents(prev => prev.filter(ev => ev.id !== editingEventId));
      setIsModalOpen(false);
      setEditingEventId(null);
    }
  };

  const moveEvent = useCallback((dropInfo: any) => {
    const { event } = dropInfo;
    setEvents(prev => prev.map(ev =>
      ev.id === event.id ? { ...ev, start: event.start!, end: event.end! } : ev
    ));
  }, []);

  // ── Renderização de eventos no calendário ──────────────────────────────────
  const eventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const status = event.extendedProps.status as string;
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.agendado;
    const dentist: string = event.extendedProps.dentist || '';
    const initial = dentist.replace(/^(Dr\.|Dra\.)\s*/i, '').charAt(0).toUpperCase();

    return (
      <div
        className="h-full w-full px-2 py-1.5 rounded-lg text-xs leading-tight overflow-hidden flex flex-col gap-0.5 relative"
        style={{ backgroundColor: cfg.bg, color: cfg.text, boxShadow: `0 2px 8px ${cfg.bg}40` }}
      >
        <div className="font-bold truncate pr-6">{event.title}</div>
        <div className="opacity-75 text-[10px] truncate flex items-center gap-1">
          <Clock size={9} strokeWidth={2.5} />
          {format(event.start!, 'HH:mm')}
        </div>
        {/* Dentist badge */}
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: cfg.text }}
        >
          {initial}
        </div>
      </div>
    );
  };

  const filteredEvents = events
    .filter(ev => selectedDentist === 'all' ? true : ev.dentist === selectedDentist)
    .map(ev => ({ ...ev, extendedProps: { ...ev } }));

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[calc(100vh-4rem)] overflow-x-hidden gap-5"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Clínica</h1>
          <p className="text-sm text-slate-500 capitalize mt-0.5">{todayLabel}</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Filtro dentista — select compacto */}
          <select
            value={selectedDentist}
            onChange={e => setSelectedDentist(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 h-[38px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all cursor-pointer shrink-0"
          >
            <option value="all">Todos os Dentistas</option>
            <option value="Dr. Carlos">Dr. Carlos</option>
            <option value="Dra. Ana">Dra. Ana</option>
          </select>

          {/* Toggle fim de semana */}
          <div className="flex items-center gap-2 bg-white px-3 h-[38px] rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
            <span className="text-sm font-medium text-slate-600">Fim de semana</span>
            <button
              onClick={() => setShowWeekends(!showWeekends)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                showWeekends ? "bg-teal-500" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                showWeekends ? "translate-x-4" : "translate-x-0"
              )} />
            </button>
          </div>

          <Button
            onClick={() => {
              const now = new Date();
              openNewAppointmentModal(now, new Date(now.getTime() + 3600000));
            }}
            className="whitespace-nowrap shrink-0 gap-2"
          >
            <Calendar size={16} /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* ── Métricas do dia ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
        {[
          { icon: Calendar, label: 'Hoje', value: todayEvents.length, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
          { icon: CheckCircle2, label: 'Confirmados', value: confirmedToday, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { icon: Clock, label: 'Aguardando', value: waitingToday, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { icon: Users, label: 'Total', value: events.length, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-xl p-4 flex items-center gap-3 shadow-sm`}>
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Calendário ───────────────────────────────────────────────────── */}
      <div className={cn(
        "flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden full-calendar-container min-h-0",
        !showWeekends && "hide-weekends"
      )}>
        {/* Legenda de status */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Status:</span>
          {Object.entries(STATUS_CONFIG).map(([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.bg }} />
              <span className="text-[11px] font-medium text-slate-500">{cfg.label}</span>
            </div>
          ))}
          {loading && (
            <div className="ml-auto flex items-center gap-1.5 text-teal-600 text-xs font-medium">
              <Loader2 size={13} className="animate-spin" /> Atualizando...
            </div>
          )}
        </div>

        <div className="p-4 flex-1 overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            locale={ptBrLocale}
            events={filteredEvents}
            eventColor="transparent"
            eventBackgroundColor="transparent"
            eventBorderColor="transparent"
            editable
            selectable
            weekends={showWeekends}
            selectMirror
            dayMaxEvents
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            expandRows
            stickyHeaderDates
            handleWindowResize
            height="100%"
            select={handleSelectSlot}
            eventClick={handleSelectEvent}
            eventDrop={moveEvent}
            eventResize={moveEvent}
            eventContent={eventContent}
            datesSet={handleDatesSet}
          />
        </div>
      </div>

      {/* ── Modal de Agendamento ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              {/* Header do modal */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingEventId ? 'Editar Agendamento' : (
                      patientStep === 'choose' ? 'Novo Agendamento' : (
                        patientType === 'existing' ? `Agendamento — ${selectedExistingPatient?.name ?? ''}` : 'Novo Agendamento'
                      )
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {editingEventId
                      ? 'Altere os dados conforme necessário.'
                      : patientStep === 'choose'
                        ? 'O paciente já é cadastrado na clínica?'
                        : 'Preencha os dados para reservar o horário.'}
                  </p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingEventId(null); }}
                  className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* ── Etapa 1: tipo de paciente ── */}
                {!editingEventId && patientStep === 'choose' && (
                  <motion.div
                    key="step-choose"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => { setPatientType('existing'); setPatientSearch(''); setSelectedExistingPatient(null); }}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center group",
                          patientType === 'existing'
                            ? "border-teal-500 bg-teal-50 shadow-sm shadow-teal-200"
                            : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                          patientType === 'existing' ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600"
                        )}>
                          <UserCheck size={22} />
                        </div>
                        <div>
                          <p className={cn("font-bold text-sm", patientType === 'existing' ? 'text-teal-700' : 'text-slate-800')}>Paciente Cadastrado</p>
                          <p className="text-xs text-slate-500 mt-0.5">Já possui prontuário na clínica</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPatientType('new'); setSelectedExistingPatient(null); }}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center group",
                          patientType === 'new'
                            ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-200"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                          patientType === 'new' ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        )}>
                          <UserPlus size={22} />
                        </div>
                        <div>
                          <p className={cn("font-bold text-sm", patientType === 'new' ? 'text-indigo-700' : 'text-slate-800')}>Novo Paciente</p>
                          <p className="text-xs text-slate-500 mt-0.5">Primeira vez na clínica</p>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {patientType === 'existing' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Buscar Paciente</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                              <input
                                type="text"
                                placeholder="Digite o nome ou telefone..."
                                value={patientSearch}
                                onChange={e => setPatientSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                            {filteredRegisteredPatients.length > 0 ? (
                              filteredRegisteredPatients.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setSelectedExistingPatient(p)}
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-slate-100 last:border-0",
                                    selectedExistingPatient?.id === p.id && "bg-teal-50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                      {p.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                                      <p className="text-xs text-slate-500">{p.phone}</p>
                                    </div>
                                  </div>
                                  {selectedExistingPatient?.id === p.id && (
                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="py-8 text-center text-sm text-slate-500">
                                Nenhum paciente encontrado.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 flex justify-end">
                      <Button
                        type="button"
                        disabled={!patientType || (patientType === 'existing' && !selectedExistingPatient)}
                        onClick={() => {
                          if (patientType === 'existing' && selectedExistingPatient) {
                            setNewEvent((prev: any) => ({
                              ...prev,
                              patientName: selectedExistingPatient.name,
                              patientPhone: selectedExistingPatient.phone,
                            }));
                          }
                          setPatientStep('form');
                        }}
                        className="gap-2"
                      >
                        Continuar <ChevronRight size={16} />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── Etapa 2: formulário ── */}
                {(editingEventId || patientStep === 'form') && (
                  <motion.form
                    key="step-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSaveEvent}
                    className="p-6 space-y-5"
                    noValidate
                  >
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        {patientType === 'existing' ? (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Paciente <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-teal-300 bg-teal-50 text-sm font-semibold text-teal-800">
                              <UserCheck size={16} className="text-teal-500 shrink-0" />
                              <span className="truncate">{newEvent.patientName}</span>
                            </div>
                          </div>
                        ) : (
                          <Input label="Paciente" required value={newEvent.patientName}
                            onChange={e => handleInputChange('patientName', e.target.value)}
                            error={errors.patientName} placeholder="Nome completo" />
                        )}
                      </div>

                      <Input label="WhatsApp" required value={newEvent.patientPhone}
                        onChange={e => handleInputChange('patientPhone', e.target.value)}
                        error={errors.patientPhone} placeholder="(00) 90000-0000"
                        readOnly={patientType === 'existing'}
                        className={patientType === 'existing' ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''} />

                      <Input type="date" label="Data de Agendamento" required
                        value={newEvent.date} onChange={e => handleInputChange('date', e.target.value)}
                        error={errors.date} />

                      <div className="grid grid-cols-2 gap-3">
                        <Input type="time" label="Hora Início" required
                          value={newEvent.time} onChange={e => handleInputChange('time', e.target.value)}
                          error={errors.time} />
                        <Input type="time" label="Hora Fim" required
                          value={newEvent.endTime} onChange={e => handleInputChange('endTime', e.target.value)}
                          error={errors.endTime} />
                      </div>

                      <Select label="Doutor(a)" required value={newEvent.dentist}
                        onChange={e => handleInputChange('dentist', e.target.value)}>
                        <option value="Dra. Ana">Dra. Ana</option>
                        <option value="Dr. Carlos">Dr. Carlos</option>
                      </Select>

                      <Select label="Tipo de Agendamento" required value={newEvent.type}
                        onChange={e => handleInputChange('type', e.target.value)}
                        error={errors.type}>
                        <option value="" disabled>Selecione...</option>
                        <option value="Consulta Inicial">Consulta Inicial</option>
                        <option value="Avaliação">Avaliação</option>
                        <option value="Procedimento">Procedimento</option>
                        <option value="Retorno">Retorno</option>
                      </Select>

                      <div className="col-span-2">
                        <Input type="number" label="Valor Estimado (R$)" placeholder="0,00"
                          value={newEvent.value} onChange={e => handleInputChange('value', e.target.value)} />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Observação / Descrição</label>
                        <textarea rows={2} value={newEvent.notes}
                          onChange={e => handleInputChange('notes', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                          placeholder="Detalhes opcionais..." />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        {editingEventId && (
                          <Button type="button" variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleDeleteEvent}>
                            Excluir
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {!editingEventId && (
                          <Button type="button" variant="ghost" onClick={() => setPatientStep('choose')}>Voltar</Button>
                        )}
                        <Button type="button" variant="ghost"
                          onClick={() => { setIsModalOpen(false); setEditingEventId(null); }}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingEventId ? 'Confirmar Alterações' : 'Confirmar Agendamento'}
                        </Button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
