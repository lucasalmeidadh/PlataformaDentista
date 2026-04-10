import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { format } from 'date-fns';
import { X, Loader2 } from 'lucide-react';
import { Button, cn } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';
import agendaService from '../../services/agendaService';

// Tipagem customizada estendendo Event do FullCalendar
export interface ClinicEvent {
  id: string;
  title: string;
  patientName: string;
  dentist: string;
  start: Date | string;
  end: Date | string;
  status: 'agendado' | 'confirmado' | 'espera' | 'faltou' | 'finalizado';
}


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
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = useCallback((dateInfo: any) => {
    fetchEvents(dateInfo.start, dateInfo.end);
  }, [fetchEvents]);

  const handleSelectSlot = useCallback((selectInfo: any) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    setNewEvent((prev: any) => ({
      ...prev,
      date: format(start, 'yyyy-MM-dd'),
      time: format(start, 'HH:mm'),
      endTime: format(end, 'HH:mm'),
      patientName: '',
      patientPhone: '',
      type: '',
      value: '',
      notes: ''
    }));
    setEditingEventId(null);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((clickInfo: any) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;
    setNewEvent({
      patientName: extendedProps.patientName,
      patientPhone: '',
      date: format(event.start!, 'yyyy-MM-dd'),
      time: format(event.start!, 'HH:mm'),
      endTime: event.end ? format(event.end, 'HH:mm') : format(new Date(event.start!.getTime() + 60 * 60 * 1000), 'HH:mm'),
      dentist: extendedProps.dentist,
      type: event.title?.split(' - ')[0] || '',
      value: '',
      notes: ''
    });
    setEditingEventId(event.id);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newEvent.patientName.trim()) newErrors.patientName = 'Preencha este campo.';
    if (!newEvent.patientPhone.trim()) newErrors.patientPhone = 'Preencha este campo.';
    if (!newEvent.date) newErrors.date = 'Preencha este campo.';
    if (!newEvent.time) newErrors.time = 'Preencha este campo.';
    if (!newEvent.endTime) newErrors.endTime = 'Preencha este campo.';
    if (!newEvent.type) newErrors.type = 'Preencha este campo.';

    if (newEvent.time && newEvent.endTime) {
      if (newEvent.endTime <= newEvent.time) {
        newErrors.endTime = 'Deve ser após a hora inicial.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setNewEvent({ ...newEvent, [field]: value });
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert date + time to Date object
    const start = new Date(`${newEvent.date}T${newEvent.time}:00`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}:00`);

    if (editingEventId) {
      setEvents(prev => prev.map(ev => ev.id === editingEventId ? {
        ...ev,
        title: `${newEvent.type || 'Consulta'} - ${newEvent.patientName}`,
        patientName: newEvent.patientName,
        dentist: newEvent.dentist,
        start,
        end
      } : ev));
    } else {
      const event: ClinicEvent = {
        id: Date.now().toString(),
        title: `${newEvent.type || 'Consulta'} - ${newEvent.patientName}`,
        patientName: newEvent.patientName,
        dentist: newEvent.dentist,
        start,
        end,
        status: 'agendado'
      };
      setEvents([...events, event]);
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

  const moveEvent = useCallback(
    (dropInfo: any) => {
      const { event } = dropInfo;
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id ? { ...ev, start: event.start!, end: event.end! } : ev
        )
      );
    },
    [setEvents]
  );

  const eventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const status = event.extendedProps.status;
    let bgColor = '#14b8a6'; // teal-500

    switch (status) {
      case 'confirmado': bgColor = '#10b981'; break;
      case 'espera': bgColor = '#f59e0b'; break;
      case 'faltou': bgColor = '#ef4444'; break;
      case 'finalizado': bgColor = '#94a3b8'; break;
    }

    return (
      <div 
        className={cn(
          "h-full w-full p-1.5 rounded-md text-xs leading-tight overflow-hidden transition-all hover:brightness-110",
          status === 'espera' ? 'text-slate-900' : 'text-white'
        )}
        style={{ backgroundColor: bgColor }}
      >
        <div className="font-bold truncate">{event.title}</div>
        <div className="opacity-90 text-[10px] truncate mt-0.5">{format(event.start!, 'HH:mm')}</div>
      </div>
    );
  };

  const filteredEvents = events
    .filter(ev => selectedDentist === 'all' ? true : ev.dentist === selectedDentist)
    .map(ev => ({
      ...ev,
      extendedProps: { ...ev }
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[calc(100vh-4rem)] overflow-x-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Clínica</h1>
          <p className="text-sm text-slate-500">Gerencie todos os atendimentos da clínica.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="w-48"
          >
            <option value="all">Todos os Dentistas</option>
            <option value="Dr. Carlos">Dr. Carlos</option>
            <option value="Dra. Ana">Dra. Ana</option>
          </Select>
          <div className="flex items-center gap-2 bg-white px-3 h-[42px] rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
            <span className="text-sm font-semibold text-slate-700">Fim de Semana</span>
            <button
              onClick={() => {
                setShowWeekends(!showWeekends);
              }}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                showWeekends ? "bg-teal-500" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  showWeekends ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap shrink-0">
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className={cn(
        "flex-1 bg-white border border-slate-200 rounded-xl shadow-soft flex flex-col overflow-hidden full-calendar-container",
        !showWeekends && "hide-weekends"
      )}>
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
            editable={true}
            selectable={true}
            weekends={showWeekends}
            selectMirror={true}
            dayMaxEvents={true}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            expandRows={true}
            stickyHeaderDates={true}
            handleWindowResize={true}
            height="100%"
            select={handleSelectSlot}
            eventClick={handleSelectEvent}
            eventDrop={moveEvent}
            eventResize={moveEvent}
            eventContent={eventContent}
            datesSet={handleDatesSet}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <span className="text-sm font-medium text-slate-600">Carregando agenda...</span>
              </div>
            </div>
          )}
        </div>
      </div>

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
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingEventId ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingEventId
                      ? 'Altere os dados do agendamento conforme necessário.'
                      : 'Insira os dados do paciente para reservar o horário.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEventId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-6 space-y-5" noValidate>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Input
                      label="Paciente"
                      required
                      value={newEvent.patientName}
                      onChange={e => handleInputChange('patientName', e.target.value)}
                      error={errors.patientName}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Input
                      label="WhatsApp"
                      required
                      value={newEvent.patientPhone}
                      onChange={e => handleInputChange('patientPhone', e.target.value)}
                      error={errors.patientPhone}
                      placeholder="(00) 90000-0000"
                    />
                  </div>

                  <div>
                    <Input
                      type="date"
                      label="Data de Agendamento"
                      required
                      value={newEvent.date}
                      onChange={e => handleInputChange('date', e.target.value)}
                      error={errors.date}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 col-span-1">
                    <div>
                      <Input
                        type="time"
                        label="Hora Início"
                        required
                        value={newEvent.time}
                        onChange={e => handleInputChange('time', e.target.value)}
                        error={errors.time}
                      />
                    </div>
                    <div>
                      <Input
                        type="time"
                        label="Hora Fim"
                        required
                        value={newEvent.endTime}
                        onChange={e => handleInputChange('endTime', e.target.value)}
                        error={errors.endTime}
                      />
                    </div>
                  </div>

                  <div>
                    <Select
                      label="Doutor(a)"
                      required
                      value={newEvent.dentist}
                      onChange={e => handleInputChange('dentist', e.target.value)}
                    >
                      <option value="Dra. Ana">Dra. Ana</option>
                      <option value="Dr. Carlos">Dr. Carlos</option>
                    </Select>
                  </div>
                  <div>
                    <Select
                      label="Tipo de Agendamento"
                      required
                      value={newEvent.type}
                      onChange={e => handleInputChange('type', e.target.value)}
                      error={errors.type}
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="Consulta Inicial">Consulta Inicial</option>
                      <option value="Avaliação">Avaliação</option>
                      <option value="Procedimento">Procedimento</option>
                      <option value="Retorno">Retorno</option>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      label="Valor Estimado (R$)"
                      placeholder="0,00"
                      value={newEvent.value}
                      onChange={e => handleInputChange('value', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 shadow-none">Observação / Descrição</label>
                    <textarea
                      rows={2}
                      value={newEvent.notes}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                      placeholder="Detalhes opcionais..."
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-xl">
                  <div>
                    {editingEventId && (
                      <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDeleteEvent}>
                        Excluir Agendamento
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingEventId(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingEventId ? 'Confirmar Alterações' : 'Confirmar Agendamento'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
