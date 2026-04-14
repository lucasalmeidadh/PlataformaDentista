import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Upload, AlertCircle, Save,
  DollarSign, FileText, ChevronRight, X, Phone
} from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';
import { Odontogram } from './Odontogram';
import { BudgetView } from './BudgetView';

// ---------------------------------------------------------------------------
// Mock — substituir por chamada de API quando disponível
// ---------------------------------------------------------------------------
const mockPatients = [
  {
    id: '1', name: 'João Silva', phone: '(11) 98765-4321', lastVisit: '15/03/2026', status: 'Ativo', balance: -150.00, lastProcedure: 'Manutenção Aparelho (10/02/2026)',
    anamnesis: {
      'Alergias Conhecidas': 'Intolerância à Lactose e Penicilina',
      'Uso Contínuo de Medicamento': 'Losartana 50mg (Hipertensão)',
      'Cirurgias Anteriores': 'Extração dos 4 sisos em 2021',
      'Histórico Familiar de Doenças': 'Pai com histórico de diabetes tipo 2'
    },
    records: [
      { id: 'r1', date: '15/03/2026', type: 'Consulta de Retorno', dentist: 'Dra. Ana', notes: 'Paciente sem queixas. Evolução ortodôntica positiva.' },
      { id: 'r2', date: '10/02/2026', type: 'Manutenção Aparelho', dentist: 'Dra. Ana', notes: 'Troca de fio e borrachinhas.' },
      { id: 'r3', date: '15/01/2026', type: 'Avaliação Inicial', dentist: 'Dr. Carlos', notes: 'Instalação do aparelho fixo.' }
    ]
  },
  { id: '2', name: 'Maria Souza', phone: '(11) 91234-5678', lastVisit: '10/02/2026', status: 'Inativo', balance: 0, lastProcedure: 'Nenhum', records: [], anamnesis: null },
  { id: '3', name: 'Pedro Alves', phone: '(11) 99999-8888', lastVisit: '18/03/2026', status: 'Ativo', balance: 50.00, lastProcedure: 'Avaliação Inicial (18/03/2026)', records: [], anamnesis: null },
];

type ActiveTab = 'visao_geral' | 'anamnese' | 'odontograma' | 'evolucao' | 'orcamentos';

export const PatientDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Carrega o paciente pelo ID (mock; trocar por API)
  const [patient, setPatient] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = mockPatients.find(p => p.id === id);
    if (found) {
      setPatient(JSON.parse(JSON.stringify(found))); // deep clone para mutação local
    } else {
      setNotFound(true);
    }
  }, [id]);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('visao_geral');

  // ── Evolução / Atendimento ─────────────────────────────────────────────────
  const [isAtendendo, setIsAtendendo] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [recordForm, setRecordForm] = useState<any>({ type: '', value: '', notes: '', dentist: 'Dra. Ana', linkedTreatments: [], isPaid: false });

  // ── Anamnese ───────────────────────────────────────────────────────────────
  const [anamnesisQuestions, setAnamnesisQuestions] = useState<string[]>([]);
  const [showAnamnesisForm, setShowAnamnesisForm] = useState(false);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});

  // ── Orçamentos ─────────────────────────────────────────────────────────────
  const [isViewingBudget, setIsViewingBudget] = useState(false);
  const [budgetTreatments, setBudgetTreatments] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('anamnesis_questions');
    if (saved) {
      setAnamnesisQuestions(JSON.parse(saved));
    } else {
      setAnamnesisQuestions(['Alergias Conhecidas', 'Uso Contínuo de Medicamento', 'Cirurgias Anteriores', 'Histórico Familiar de Doenças']);
    }
  }, []);

  // ── Handlers Anamnese ──────────────────────────────────────────────────────
  const handleStartAnamnesis = () => { setAnamnesisAnswers({}); setShowAnamnesisForm(true); };
  const handleEditAnamnesis = () => {
    setAnamnesisAnswers(patient?.anamnesis ? { ...patient.anamnesis } : {});
    setShowAnamnesisForm(true);
  };
  const handleSaveAnamnesis = () => {
    setPatient((prev: any) => ({ ...prev, anamnesis: anamnesisAnswers }));
    setShowAnamnesisForm(false);
  };

  // ── Handlers Evolução ──────────────────────────────────────────────────────
  const handleStartAttendance = () => {
    setRecordForm({ type: '', value: '', notes: '', dentist: 'Dra. Ana', linkedTreatments: [], isPaid: false });
    setSelectedRecord(null);
    setIsAtendendo(true);
  };
  const handleEditRecord = () => {
    setRecordForm({
      type: selectedRecord.type || '',
      value: selectedRecord.value || '',
      notes: selectedRecord.notes || '',
      dentist: selectedRecord.dentist || 'Dra. Ana',
      linkedTreatments: selectedRecord.linkedTreatments || [],
      isPaid: selectedRecord.isPaid || false
    });
    setIsAtendendo(true);
  };
  const handleSaveRecord = () => {
    if (!patient) return;
    if (selectedRecord && isAtendendo) {
      const updatedRecords = patient.records.map((r: any) =>
        r.id === selectedRecord.id
          ? { ...r, type: recordForm.type, value: recordForm.value, notes: recordForm.notes, dentist: recordForm.dentist }
          : r
      );
      setPatient((prev: any) => ({ ...prev, records: updatedRecords }));
    } else {
      const newRecord = {
        id: `r${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        type: recordForm.type || 'Nova Evolução',
        dentist: recordForm.dentist || 'Dra. Ana',
        notes: recordForm.notes,
        value: recordForm.value,
        linkedTreatments: recordForm.linkedTreatments,
        isPaid: recordForm.isPaid
      };

      let updatedTreatments = patient.treatments ? [...patient.treatments] : [];
      if (recordForm.linkedTreatments?.length > 0) {
        updatedTreatments = updatedTreatments.map((t: any) =>
          recordForm.linkedTreatments.includes(t.id) ? { ...t, status: 'done' } : t
        );
      }

      setPatient((prev: any) => ({
        ...prev,
        records: [newRecord, ...(prev.records || [])],
        treatments: updatedTreatments
      }));
      setSelectedRecord(newRecord);
    }
    setIsAtendendo(false);
  };

  // ── Handlers Orçamento ────────────────────────────────────────────────────
  const handleApproveBudget = (total: number) => {
    const newRecord = {
      id: `r_budget_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'Orçamento Aprovado',
      dentist: 'Dra. Ana',
      notes: `Orçamento aprovado no valor total de R$ ${total.toFixed(2)}.`,
      value: total.toString(),
      isPaid: false
    };
    const newBudget = {
      id: `orc_app_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Aprovado',
      total,
      treatments: [...budgetTreatments]
    };
    setPatient((prev: any) => ({
      ...prev,
      balance: (prev.balance || 0) - total,
      records: [newRecord, ...(prev.records || [])],
      budgets: [newBudget, ...(prev.budgets || [])]
    }));
    setIsViewingBudget(false);
    setActiveTab('visao_geral');
  };

  const handleSaveDraftBudget = (total: number) => {
    const newBudget = {
      id: `orc_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Rascunho',
      total,
      treatments: [...budgetTreatments]
    };
    setPatient((prev: any) => ({ ...prev, budgets: [newBudget, ...(prev.budgets || [])] }));
    setIsViewingBudget(false);
    setActiveTab('orcamentos');
  };

  // ── Carregamento / Not Found ───────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Paciente não encontrado</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6">O ID informado não corresponde a nenhum cadastro.</p>
        <Button onClick={() => navigate('/dashboard/pacientes')}>← Voltar para Pacientes</Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'visao_geral', label: 'Visão Geral' },
    { key: 'anamnese', label: 'Anamnese' },
    { key: 'odontograma', label: 'Odontograma' },
    { key: 'evolucao', label: 'Evolução Clínica' },
    { key: 'orcamentos', label: 'Orçamentos' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/dashboard/pacientes')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Pacientes
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/20 shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  patient.status === 'Ativo'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {patient.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} />
                  {patient.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Última visita: {patient.lastVisit}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'evolucao' && !isAtendendo && !selectedRecord && (
              <Button onClick={handleStartAttendance} className="gap-2">
                <Calendar size={16} />
                Iniciar Atendimento
              </Button>
            )}
            {isAtendendo && (
              <>
                <Button variant="outline" onClick={() => { setIsAtendendo(false); setSelectedRecord(null); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveRecord}>
                  {selectedRecord ? 'Salvar Alterações' : 'Finalizar Consulta'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      {!isViewingBudget && (
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 shadow-sm overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setIsAtendendo(false); setSelectedRecord(null); }}
              className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Conteúdo das Abas ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">

          {/* ── Orçamento em tela cheia ── */}
          {isViewingBudget && (
            <BudgetView
              key="budgetView"
              patient={patient}
              treatments={budgetTreatments}
              onBack={() => setIsViewingBudget(false)}
              onApprove={handleApproveBudget}
              onSaveDraft={handleSaveDraftBudget}
            />
          )}

          {/* ── Visão Geral ── */}
          {!isViewingBudget && activeTab === 'visao_geral' && (
            <motion.div key="visaoGeral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {patient.anamnesis ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm flex gap-3">
                  <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-yellow-900">Atenção Médica</h4>
                    <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                      <span className="font-semibold">Alergias:</span> {patient.anamnesis['Alergias Conhecidas'] || 'Nenhuma'} <br />
                      <span className="font-semibold">Uso Contínuo:</span> {patient.anamnesis['Uso Contínuo de Medicamento'] || 'Nenhum'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex gap-3">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Anamnese Pendente</h4>
                    <p className="text-xs text-red-800 mt-1">Este paciente ainda não possui histórico de saúde preenchido.</p>
                    <Button size="sm" variant="outline" className="mt-3 bg-white border-red-200 text-red-700 hover:bg-red-50" onClick={() => setActiveTab('anamnese')}>
                      Preencher Anamnese Agora
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={14} /> Último Procedimento</p>
                  <p className="text-base font-bold text-slate-800 mt-3">{patient.lastProcedure || 'Nenhum'}</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><DollarSign size={14} /> Saldo Financeiro</p>
                  <p className={`text-2xl font-bold mt-2 ${(patient.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    R$ {Math.abs(patient.balance || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                    {(patient.balance || 0) < 0 ? 'Débito pendente' : 'Acerto regular'}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><FileText size={14} /> Total de Evoluções</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{patient.records?.length ?? 0}</p>
                </div>
              </div>

              {/* Últimos atendimentos na visão geral */}
              {patient.records?.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700">Últimos Atendimentos</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('evolucao')}>
                      Ver todos <ChevronRight size={14} />
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {patient.records.slice(0, 3).map((r: any) => (
                      <div key={r.id} className="px-5 py-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{r.type}</p>
                          <p className="text-xs text-slate-500">{r.date} • {r.dentist}</p>
                        </div>
                        {r.value && <span className="text-slate-600 font-semibold text-xs bg-slate-100 px-2 py-0.5 rounded">R$ {r.value}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Anamnese ── */}
          {!isViewingBudget && activeTab === 'anamnese' && (
            <motion.div key="anamnese" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Formulário de Anamnese</h3>
                {patient.anamnesis && !showAnamnesisForm && (
                  <Button variant="outline" size="sm" onClick={handleEditAnamnesis}>Editar Respostas</Button>
                )}
              </div>

              {!showAnamnesisForm ? (
                patient.anamnesis ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(patient.anamnesis).map(([q, a], idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1 block">{q}</label>
                        <p className="text-sm text-slate-900 font-medium">{String(a) || 'Não informado'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <FileText className="text-slate-300 mx-auto mb-4" size={40} />
                    <h4 className="text-sm font-bold text-slate-700">Nenhuma Anamnese Registrada</h4>
                    <p className="text-xs text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Preencher o formulário de saúde é obrigatório antes de iniciar qualquer planejamento no odontograma.</p>
                    <Button onClick={handleStartAnamnesis}>Iniciar Preenchimento</Button>
                  </div>
                )
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium mb-4 flex gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    Preencha as informações médicas com atenção ao relatar ao paciente.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {anamnesisQuestions.map((q, idx) => (
                      <Input
                        key={idx}
                        label={q}
                        value={anamnesisAnswers[q] || ''}
                        onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, [q]: e.target.value })}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setShowAnamnesisForm(false)}>Cancelar</Button>
                    <Button onClick={handleSaveAnamnesis} className="gap-2"><Save size={16} /> Salvar Anamnese</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Odontograma ── */}
          {!isViewingBudget && activeTab === 'odontograma' && (
            <motion.div key="odontograma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              {!patient.anamnesis ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <AlertCircle size={56} className="text-red-500 mb-5 opacity-40" />
                  <h3 className="text-xl font-bold text-slate-900">Segurança Bloqueada</h3>
                  <p className="text-sm text-slate-500 mt-3 max-w-md leading-relaxed">
                    Para garantir a segurança do paciente e da clínica, o odontograma só é liberado <strong>após o preenchimento obrigatório da Anamnese.</strong>
                  </p>
                  <Button className="mt-8 bg-red-600 hover:bg-red-700 w-full max-w-xs text-white shadow-md shadow-red-600/20" onClick={() => setActiveTab('anamnese')}>
                    Preencher Anamnese Agora
                  </Button>
                </div>
              ) : (
                <Odontogram
                  onStartAttendance={() => { handleStartAttendance(); setActiveTab('evolucao'); }}
                  treatments={patient.treatments || []}
                  onChangeTreatments={(t) => setPatient((prev: any) => ({ ...prev, treatments: t }))}
                  teethStatus={patient.teethStatus || {}}
                  onChangeTeethStatus={(s) => setPatient((prev: any) => ({ ...prev, teethStatus: s }))}
                  onApproveBudget={(t) => { setBudgetTreatments(t); setIsViewingBudget(true); }}
                />
              )}
            </motion.div>
          )}

          {/* ── Evolução Clínica ── */}
          {!isViewingBudget && activeTab === 'evolucao' && (
            <motion.div key="evolucao" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isAtendendo ? (
                <div className="space-y-6">
                  {/* Banner atendimento */}
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle className="text-teal-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-teal-900">{selectedRecord ? 'Editando Evolução Clínica' : 'Atendimento em Andamento'}</h4>
                      <p className="text-xs text-teal-700 mt-1">Dê baixa num procedimento do odontograma ou registre uma nova evolução livre.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    {/* Vínculo com odontograma */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Vincular Procedimentos Planejados (Odontograma)</label>
                        <Button variant="outline" size="sm" onClick={() => { setIsAtendendo(false); setActiveTab('odontograma'); }}
                          className="text-xs h-8 flex items-center gap-1.5 text-teal-600 border-teal-200 hover:bg-teal-50 bg-white">
                          Acessar Odontograma <ChevronRight size={14} />
                        </Button>
                      </div>
                      {patient.treatments?.filter((t: any) => t.status === 'planned').length > 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                          {patient.treatments.filter((t: any) => t.status === 'planned').map((t: any) => {
                            const isChecked = recordForm.linkedTreatments?.includes(t.id);
                            return (
                              <label key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let newLinked = [...(recordForm.linkedTreatments || [])];
                                    if (e.target.checked) newLinked.push(t.id); else newLinked = newLinked.filter((id: string) => id !== t.id);
                                    const selectedTreatments = patient.treatments.filter((st: any) => newLinked.includes(st.id));
                                    setRecordForm({
                                      ...recordForm,
                                      linkedTreatments: newLinked,
                                      type: newLinked.length > 0 ? `Realizado: ${selectedTreatments.map((st: any) => st.procedure).join(', ')}` : recordForm.type,
                                      value: newLinked.length > 0 ? selectedTreatments.reduce((sum: number, st: any) => sum + st.price, 0).toString() : recordForm.value,
                                    });
                                  }}
                                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                                />
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">Dente {t.tooth} - {t.procedure}</p>
                                  <p className="text-xs text-slate-500">R$ {t.price.toFixed(2)}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center text-sm text-slate-500">
                          Nenhum procedimento planejado no Odontograma.
                        </div>
                      )}
                    </div>

                    {/* Campos */}
                    <Input
                      label="Título do Atendimento"
                      placeholder="Ex: Avaliação / Dor dente 47"
                      value={recordForm.type}
                      onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="Valor do Procedimento (R$)"
                        type="number"
                        placeholder="0,00"
                        value={recordForm.value}
                        onChange={(e) => setRecordForm({ ...recordForm, value: e.target.value })}
                      />
                      <div
                        className="flex items-center justify-between h-10 mt-[26px] bg-emerald-50 border border-emerald-100 px-4 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => setRecordForm({ ...recordForm, isPaid: !recordForm.isPaid })}
                      >
                        <p className="text-sm font-bold text-emerald-800">Pagamento Realizado?</p>
                        <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${recordForm.isPaid ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${recordForm.isPaid ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </div>
                    <Select
                      label="Profissional Responsável"
                      value={recordForm.dentist}
                      onChange={(e) => setRecordForm({ ...recordForm, dentist: e.target.value })}
                    >
                      <option value="Dra. Ana">Dra. Ana</option>
                      <option value="Dr. Carlos">Dr. Carlos</option>
                    </Select>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Evolução Clínica / Anotações</label>
                      <textarea
                        rows={5}
                        className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none shadow-sm"
                        placeholder="Descreva detalhadamente o que foi feito na sessão de hoje..."
                        value={recordForm.notes}
                        onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                      />
                    </div>
                    {/* Anexos */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">Fazer Upload de Arquivo</h4>
                      <p className="text-xs text-slate-500 mt-1">Arraste Raio-X, Fotos ou Documentos (Max 10MB)</p>
                    </div>
                  </div>
                </div>
              ) : !selectedRecord ? (
                /* Timeline */
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={16} className="text-teal-600" /> Timeline de Atendimentos
                    </h3>
                    <Button size="sm" onClick={handleStartAttendance}>Adicionar Evolução Hoje</Button>
                  </div>
                  {patient.records?.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 relative before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-slate-100">
                      {patient.records.map((record: any) => (
                        <button
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className="w-full text-left p-5 hover:bg-slate-50 transition-colors flex flex-col group relative z-10"
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white shadow-sm shrink-0 ml-1" />
                            <p className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{record.type}</p>
                          </div>
                          <div className="pl-9 text-xs text-slate-500 flex items-center gap-3">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Calendar size={14} /> {record.date}</span>
                            <span>•</span>
                            <span>Por {record.dentist}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                      Nenhum atendimento registrado.
                    </div>
                  )}
                </div>
              ) : (
                /* Detalhe do registro */
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors group"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar para Timeline
                  </button>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                      <div>
                        <div className="text-sm font-bold text-slate-900 mb-1">{selectedRecord.type}</div>
                        <div className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
                          <Calendar size={14} /> {selectedRecord.date} — Por {selectedRecord.dentist}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {selectedRecord.value && (
                          <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">R$ {selectedRecord.value}</div>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleEditRecord}>Editar Registro</Button>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Anotações da Evolução</h4>
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Orçamentos ── */}
          {!isViewingBudget && activeTab === 'orcamentos' && (
            <motion.div key="orcamentos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-teal-600" /> Histórico de Orçamentos
                </h3>
                <Button size="sm" onClick={() => setActiveTab('odontograma')}>Novo Orçamento</Button>
              </div>
              {patient.budgets?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {patient.budgets.map((budget: any) => (
                    <div key={budget.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-teal-200 transition-all flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${budget.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Orçamento #{budget.id.slice(-6)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{budget.date} • {budget.treatments.length} procedimentos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">R$ {budget.total.toFixed(2)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${budget.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {budget.status}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => { setBudgetTreatments(budget.treatments); setIsViewingBudget(true); }}>
                          Abrir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <FileText className="text-slate-300 mx-auto mb-4" size={40} />
                  <h4 className="text-sm font-bold text-slate-700">Nenhum Orçamento Encontrado</h4>
                  <p className="text-xs text-slate-500 mt-2 mb-6">Comece hoje mesmo um novo planejamento no Odontograma.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Modal Anamnese Form (overlay) ── */}
      <AnimatePresence>
        {showAnamnesisForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Preencher Anamnese</h3>
                  <p className="text-sm text-slate-500">Paciente: {patient.name}</p>
                </div>
                <button onClick={() => setShowAnamnesisForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {anamnesisQuestions.map((q, idx) => (
                  <Input key={idx} label={q} value={anamnesisAnswers[q] || ''} onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, [q]: e.target.value })} />
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setShowAnamnesisForm(false)}>Cancelar</Button>
                <Button onClick={handleSaveAnamnesis} className="gap-2"><Save size={16} /> Salvar Anamnese</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
