import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileText, X, ChevronRight, ArrowLeft, Calendar, Upload, AlertCircle, Save, DollarSign } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';
import { Odontogram } from './Odontogram';
import { BudgetView } from './BudgetView';

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

export const PatientsView = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isAtendendo, setIsAtendendo] = useState(false);
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'anamnese' | 'odontograma' | 'evolucao' | 'orcamentos'>('visao_geral');
  const [isViewingBudget, setIsViewingBudget] = useState(false);
  const [budgetTreatments, setBudgetTreatments] = useState<any[]>([]);

  // New Patient State
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', phone: '', status: 'Ativo' });

  // Record Form State
  const [recordForm, setRecordForm] = useState<any>({ type: '', value: '', notes: '', dentist: '', linkedTreatments: [], isPaid: false });

  // New States for Anamnese
  const [anamnesisQuestions, setAnamnesisQuestions] = useState<string[]>([]);
  const [showAnamnesisForm, setShowAnamnesisForm] = useState(false);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});
  const [showCompleteAnamnesis, setShowCompleteAnamnesis] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('anamnesis_questions');
    if (saved) {
      setAnamnesisQuestions(JSON.parse(saved));
    } else {
      setAnamnesisQuestions(["Alergias Conhecidas", "Uso Contínuo de Medicamento", "Cirurgias Anteriores", "Histórico Familiar de Doenças"]);
    }
  }, []);

  const handleStartAnamnesis = () => {
    setAnamnesisAnswers({});
    setShowAnamnesisForm(true);
  };

  const handleEditAnamnesis = () => {
    if (selectedPatient?.anamnesis) {
      setAnamnesisAnswers({ ...selectedPatient.anamnesis });
    } else {
      setAnamnesisAnswers({});
    }
    setShowAnamnesisForm(true);
  };

  const handleSaveAnamnesis = () => {
    if (selectedPatient) {
      selectedPatient.anamnesis = anamnesisAnswers;
    }
    setShowAnamnesisForm(false);
  };

  const handleStartAttendance = () => {
    setRecordForm({ type: '', value: '', notes: '', dentist: 'Dra. Lucas Almeida', linkedTreatments: [], isPaid: false });
    setSelectedRecord(null);
    setIsAtendendo(true);
  };

  const handleEditRecord = () => {
    setRecordForm({
      type: selectedRecord.type || '',
      value: selectedRecord.value || '',
      notes: selectedRecord.notes || '',
      dentist: selectedRecord.dentist || 'Dra. Lucas Almeida',
      linkedTreatments: selectedRecord.linkedTreatments || [],
      isPaid: selectedRecord.isPaid || false
    });
    setIsAtendendo(true);
  };

  const handleSaveRecord = () => {
    if (!selectedPatient) return;

    if (selectedRecord && isAtendendo) {
      // Edit existing
      selectedRecord.type = recordForm.type;
      selectedRecord.value = recordForm.value;
      selectedRecord.notes = recordForm.notes;
      selectedRecord.dentist = recordForm.dentist;
    } else {
      // Create new
      const newRecord = {
        id: `r${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        type: recordForm.type || 'Nova Evolução',
        dentist: recordForm.dentist || 'Dra. Lucas Almeida',
        notes: recordForm.notes,
        value: recordForm.value,
        linkedTreatments: recordForm.linkedTreatments,
        isPaid: recordForm.isPaid
      };

      if (recordForm.linkedTreatments && recordForm.linkedTreatments.length > 0 && selectedPatient.treatments) {
        recordForm.linkedTreatments.forEach((tid: string) => {
          const tIndex = selectedPatient.treatments.findIndex((t: any) => t.id === tid);
          if (tIndex >= 0) {
            selectedPatient.treatments[tIndex].status = 'done';
            if (!selectedPatient.teethStatus) selectedPatient.teethStatus = {};
            const toothNum = selectedPatient.treatments[tIndex].tooth;
            if (!selectedPatient.teethStatus[toothNum] || typeof selectedPatient.teethStatus[toothNum] === 'string') {
              selectedPatient.teethStatus[toothNum] = { status: 'done', faces: {} };
            } else {
              selectedPatient.teethStatus[toothNum].status = 'done';
            }
          }
        });

        // Atualizar o paciente com a nova lista de treatments clonada para forçar o re-render
        setSelectedPatient({ ...selectedPatient, treatments: [...selectedPatient.treatments] });
      }

      selectedPatient.records = [newRecord, ...(selectedPatient.records || [])];
      setSelectedRecord(newRecord); // To show detail view after saving
    }
    setIsAtendendo(false);
  };

  const handleApproveBudget = (total: number) => {
    if (!selectedPatient) return;

    // Create a record for the budget approval
    const newRecord = {
      id: `r_budget_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'Orçamento Aprovado',
      dentist: 'Dra. Lucas Almeida',
      notes: `Orçamento aprovado no valor total de R$ ${total.toFixed(2)}. Procedimentos adicionados ao plano de tratamento.`,
      value: total.toString(),
      isPaid: false
    };

    const newBudget = {
      id: `orc_app_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Aprovado',
      total: total,
      treatments: [...budgetTreatments]
    };

    const updatedPatient = {
      ...selectedPatient,
      balance: (selectedPatient.balance || 0) - total,
      records: [newRecord, ...(selectedPatient.records || [])],
      budgets: [newBudget, ...(selectedPatient.budgets || [])]
    };

    setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
    setIsViewingBudget(false);
    setActiveTab('visao_geral');
  };

  const handleSaveDraftBudget = (total: number) => {
    if (!selectedPatient) return;

    const newBudget = {
      id: `orc_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Rascunho',
      total: total,
      treatments: [...budgetTreatments]
    };

    const updatedPatient = {
      ...selectedPatient,
      budgets: [newBudget, ...(selectedPatient.budgets || [])]
    };

    setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
    setIsViewingBudget(false);
    setActiveTab('orcamentos');
  };

  const handleSaveNewPatient = () => {
    if (!newPatientForm.name) return;

    const newPatient = {
      id: `p${Date.now()}`,
      name: newPatientForm.name,
      phone: newPatientForm.phone,
      lastVisit: '-',
      status: newPatientForm.status,
      balance: 0,
      lastProcedure: 'Nenhum',
      anamnesis: null,
      records: []
    };

    setPatients([newPatient, ...patients]);
    setNewPatientForm({ name: '', phone: '', status: 'Ativo' });
    setShowNewPatientModal(false);
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative uppercase-none overflow-x-hidden min-w-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-sm text-slate-500">Gestão de prontuários, histórico e anamnese.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewPatientModal(true)}>
          <Plus size={18} /> Novo Paciente
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-soft flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input
              placeholder="Buscar por nome ou CPF..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filtros Avançados</Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold sticky top-0">
              <tr>
                <th className="px-6 py-4">Nome do Paciente</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Última Consulta</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                  <td className="px-6 py-4">{patient.phone}</td>
                  <td className="px-6 py-4">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${patient.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedPatient(patient)}
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                    >
                      Abrir Prontuário
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer do Prontuário */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full max-w-5xl bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] border-l border-slate-200 z-50 flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                {(selectedRecord || isAtendendo) && (
                  <button
                    onClick={() => {
                      if (isAtendendo) setIsAtendendo(false);
                      else setSelectedRecord(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                  <p className="text-sm text-slate-500">
                    {isAtendendo ? (selectedRecord ? 'Editando Evolução' : 'Realizando Atendimento') : selectedRecord ? `Prontuário - ${selectedRecord.date}` : 'Histórico Clínico'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPatient(null); setSelectedRecord(null); setIsAtendendo(false); setActiveTab('visao_geral'); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* TABS */}
            {!isAtendendo && !selectedRecord && (
              <div className="px-6 flex gap-6 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('visao_geral')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'visao_geral' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('anamnese')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'anamnese' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Anamnese
                </button>
                <button
                  onClick={() => setActiveTab('odontograma')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'odontograma' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Odontograma
                </button>
                <button
                  onClick={() => setActiveTab('evolucao')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'evolucao' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Evolução Clínica
                </button>
                <button
                  onClick={() => setActiveTab('orcamentos')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'orcamentos' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Orçamentos
                </button>
              </div>
            )}

            <div className={`p-6 flex-1 relative ${activeTab === 'odontograma' && selectedPatient.anamnesis && !isViewingBudget ? 'overflow-y-auto overflow-x-hidden bg-slate-50/50 flex flex-col' : 'overflow-y-auto'}`}>
              <AnimatePresence mode="wait">
                {isViewingBudget ? (
                  <BudgetView
                    key="budgetView"
                    patient={selectedPatient}
                    treatments={budgetTreatments}
                    onBack={() => setIsViewingBudget(false)}
                    onApprove={handleApproveBudget}
                    onSaveDraft={handleSaveDraftBudget}
                  />
                ) : activeTab === 'visao_geral' && (
                  <motion.div key="visaoGeral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    {selectedPatient.anamnesis ? (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm flex gap-3">
                        <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="text-sm font-bold text-yellow-900">Atenção Médica</h4>
                          <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                            <span className="font-semibold">Alergias:</span> {selectedPatient.anamnesis['Alergias Conhecidas'] || 'Nenhuma'} <br />
                            <span className="font-semibold">Uso Contínuo:</span> {selectedPatient.anamnesis['Uso Contínuo de Medicamento'] || 'Nenhum'}
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={14} /> Último Procedimento</p>
                        <p className="text-lg font-bold text-slate-800 mt-3">{selectedPatient.lastProcedure || 'Nenhum'}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><DollarSign size={14} /> Saldo Financeiro</p>
                        <p className={`text-2xl font-bold mt-2 ${(selectedPatient.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          R$ {Math.abs(selectedPatient.balance || 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                          {(selectedPatient.balance || 0) < 0 ? 'Débito pendente' : 'Acerto regular'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'anamnese' && (
                  <motion.div key="anamneseTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-slate-900">Formulário de Anamnese</h3>
                      {selectedPatient.anamnesis && !showAnamnesisForm && (
                        <Button variant="outline" size="sm" onClick={() => handleEditAnamnesis()}>Editar Respostas</Button>
                      )}
                    </div>

                    {!showAnamnesisForm ? (
                      selectedPatient.anamnesis ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                          {Object.entries(selectedPatient.anamnesis).map(([q, a], idx) => (
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
                          <p className="text-xs text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Preencher o formulário de saúde base é obrigatório antes de iniciar qualquer planejamento no odontograma.</p>
                          <Button onClick={() => handleStartAnamnesis()}>Iniciar Preenchimento</Button>
                        </div>
                      )
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium mb-4 flex gap-2">
                          <AlertCircle size={16} className="shrink-0" />
                          Preencha as informações médicas com atenção ao relatar ao paciente.
                        </div>
                        {anamnesisQuestions.map((q, idx) => (
                          <Input
                            key={idx}
                            label={q}
                            value={anamnesisAnswers[q] || ''}
                            onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, [q]: e.target.value })}
                          />
                        ))}
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                          <Button variant="outline" onClick={() => setShowAnamnesisForm(false)}>Cancelar</Button>
                          <Button onClick={() => handleSaveAnamnesis()} className="gap-2"><Save size={16} /> Salvar Anamnese</Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'odontograma' && (
                  <motion.div key="odontogramaTab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    {!selectedPatient.anamnesis ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
                        <AlertCircle size={56} className="text-red-500 mb-5 opacity-40" />
                        <h3 className="text-xl font-bold text-slate-900">Segurança Bloqueada</h3>
                        <p className="text-sm text-slate-500 mt-3 max-w-md leading-relaxed">
                          Para garantir a segurança tanto do paciente quanto da clínica, o planejamento do Odontograma só é liberado <strong>após o preenchimento obrigatório da Anamnese.</strong>
                        </p>
                        <Button className="mt-8 bg-red-600 hover:bg-red-700 w-full max-w-xs text-white shadow-md shadow-red-600/20" onClick={() => setActiveTab('anamnese')}>
                          Preencher Anamnese Agora
                        </Button>
                      </div>
                    ) : (
                      <Odontogram
                        onStartAttendance={() => { handleStartAttendance(); setActiveTab('evolucao'); }}
                        treatments={selectedPatient.treatments || []}
                        onChangeTreatments={(t) => setSelectedPatient((prev: any) => ({ ...prev, treatments: t }))}
                        teethStatus={selectedPatient.teethStatus || {}}
                        onChangeTeethStatus={(s) => setSelectedPatient((prev: any) => ({ ...prev, teethStatus: s }))}
                        onApproveBudget={(t) => {
                          setBudgetTreatments(t);
                          setIsViewingBudget(true);
                        }}
                      />
                    )}
                  </motion.div>
                )}

                {activeTab === 'evolucao' && (
                  <motion.div key="evolucaoTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {isAtendendo ? (
                      <div className="space-y-6">
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex gap-3 items-start">
                          <AlertCircle className="text-teal-600 shrink-0 mt-0.5" size={20} />
                          <div>
                            <h4 className="text-sm font-bold text-teal-900">{selectedRecord ? 'Editando Evolução Clínica' : 'Atendimento em Andamento'}</h4>
                            <p className="text-xs text-teal-700 mt-1">Dê baixa num procedimento do odontograma ou registre uma nova evolução livre.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-6">
                          <div className="col-span-2">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-slate-700">Vincular Procedimentos Planejados (Odontograma)</label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setIsAtendendo(false); setActiveTab('odontograma'); }}
                                className="text-xs h-8 flex items-center gap-1.5 text-teal-600 border-teal-200 hover:bg-teal-50 bg-white"
                              >
                                Acessar Odontograma <ChevronRight size={14} />
                              </Button>
                            </div>
                            {selectedPatient.treatments?.filter((t: any) => t.status === 'planned').length > 0 ? (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                                {selectedPatient.treatments?.filter((t: any) => t.status === 'planned').map((t: any) => {
                                  const isChecked = recordForm.linkedTreatments?.includes(t.id);
                                  return (
                                    <label key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const isSelected = e.target.checked;
                                          let newLinked = [...(recordForm.linkedTreatments || [])];
                                          if (isSelected) newLinked.push(t.id);
                                          else newLinked = newLinked.filter((id) => id !== t.id);

                                          // Calculate autos
                                          const selectedTreatments = selectedPatient.treatments.filter((st: any) => newLinked.includes(st.id));
                                          let newTitle = recordForm.type;
                                          let newNotes = recordForm.notes;

                                          if (newLinked.length > 0) {
                                            newTitle = `Realizado: ${selectedTreatments.map((st: any) => st.procedure).join(', ')}`;
                                            const proceduresText = selectedTreatments.map((st: any) => `${st.procedure} (Dente ${st.tooth})`).join('\n- ');
                                            newNotes = `Procedimentos realizados na sessão:\n- ${proceduresText}\n\nSem intercorrências.`;
                                          }

                                          const newValue = selectedTreatments.reduce((sum: number, st: any) => sum + st.price, 0).toString();

                                          setRecordForm({
                                            ...recordForm,
                                            linkedTreatments: newLinked,
                                            type: newLinked.length > 0 ? newTitle : recordForm.type,
                                            value: newLinked.length > 0 ? newValue : recordForm.value,
                                            notes: newLinked.length > 0 ? newNotes : recordForm.notes
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
                                Nenhum procedimento planejado no Odontograma. Crie uma evolução avulsa.
                              </div>
                            )}
                          </div>

                          <div className="col-span-2">
                            <Input
                              label="Título do Atendimento"
                              placeholder="Ex: Avaliação / Dor dente 47"
                              value={recordForm.type}
                              onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row col-span-2 gap-5">
                            <div className="flex-1">
                              <Input
                                label="Valor do Procedimento (R$)"
                                type="number"
                                placeholder="0,00"
                                value={recordForm.value}
                                onChange={(e) => setRecordForm({ ...recordForm, value: e.target.value })}
                              />
                            </div>

                            <div className="flex-1 flex items-end">
                              <div
                                className="w-full h-[42px] flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors shadow-sm"
                                onClick={() => setRecordForm({ ...recordForm, isPaid: !recordForm.isPaid })}
                              >
                                <div>
                                  <p className="text-sm font-bold text-emerald-800">Pagamento Realizado?</p>
                                </div>
                                <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${recordForm.isPaid ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${recordForm.isPaid ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Select
                              label="Profissional Responsável"
                              value={recordForm.dentist}
                              onChange={(e) => setRecordForm({ ...recordForm, dentist: e.target.value })}
                            >
                              <option value="Dra. Lucas Almeida">Dra. Lucas Almeida</option>
                              <option value="Dra. Ana">Dra. Ana</option>
                              <option value="Dr. Carlos">Dr. Carlos</option>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Evolução Clínica / Anotações</label>
                          <textarea
                            rows={6}
                            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none shadow-sm"
                            placeholder="Descreva detalhadamente o que foi feito na sessão de hoje..."
                            value={recordForm.notes}
                            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Anexos Clínicos</label>
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
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={16} className="text-teal-600" />
                            Timeline de Atendimentos
                          </h3>
                          <Button size="sm" onClick={() => handleStartAttendance()}>Adicionar Evolução Hoje</Button>
                        </div>

                        {selectedPatient.records && selectedPatient.records.length > 0 ? (
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 relative before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-slate-100">
                            {selectedPatient.records.map((record: any) => (
                              <button
                                key={record.id}
                                onClick={() => setSelectedRecord(record)}
                                className="w-full text-left p-5 hover:bg-slate-50 transition-colors flex flex-col group relative z-10"
                              >
                                <div className="flex items-center gap-4 mb-2">
                                  <div className="w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white shadow-sm shrink-0 ml-1"></div>
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
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                            <div>
                              <div className="text-sm font-bold text-slate-900 mb-1">{selectedRecord.type}</div>
                              <div className="text-xs font-semibold text-teal-600 flex items-center gap-1.5"><Calendar size={14} /> {selectedRecord.date} - Por {selectedRecord.dentist}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              {selectedRecord.value && (
                                <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                  R$ {selectedRecord.value}
                                </div>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleEditRecord()}>Editar Registro</Button>
                            </div>
                          </div>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Anotações da Evolução</h4>
                          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedRecord.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'orcamentos' && (
                  <motion.div key="orcamentosTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-teal-600" />
                        Histórico de Orçamentos
                      </h3>
                      <Button size="sm" onClick={() => setActiveTab('odontograma')}>Novo Orçamento</Button>
                    </div>

                    {selectedPatient.budgets && selectedPatient.budgets.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {selectedPatient.budgets.map((budget: any) => (
                          <div key={budget.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-teal-200 transition-all group flex justify-between items-center">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-teal-600"
                                onClick={() => {
                                  setBudgetTreatments(budget.treatments);
                                  setIsViewingBudget(true);
                                }}
                              >
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

            <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
              {isAtendendo ? (
                <>
                  <Button variant="outline" onClick={() => { setIsAtendendo(false); if (!selectedRecord) { setSelectedRecord(null); } }}>Cancelar</Button>
                  <Button onClick={() => handleSaveRecord()}>{selectedRecord ? 'Salvar Alterações' : 'Finalizar Consulta'}</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setSelectedPatient(null); setSelectedRecord(null); setIsAtendendo(false); setActiveTab('visao_geral'); }}>Fechar</Button>
                  {selectedRecord && <Button>Imprimir Prontuário</Button>}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Anamnese Completa */}
      <AnimatePresence>
        {showCompleteAnamnesis && selectedPatient?.anamnesis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Anamnese Completa</h3>
                  <p className="text-sm text-slate-500">Paciente: {selectedPatient.name}</p>
                </div>
                <button onClick={() => setShowCompleteAnamnesis(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {Object.entries(selectedPatient.anamnesis).map(([question, answer], idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <label className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1 block">{question}</label>
                      <p className="text-sm text-slate-900 font-medium">{String(answer) || 'Não informado'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-xl">
                <Button variant="outline" onClick={() => { setShowCompleteAnamnesis(false); handleEditAnamnesis(); }}>Editar Anamnese</Button>
                <Button onClick={() => setShowCompleteAnamnesis(false)}>Fechar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Formulário de Anamnese */}
      <AnimatePresence>
        {showAnamnesisForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Preencher Anamnese</h3>
                  <p className="text-sm text-slate-500">Paciente: {selectedPatient?.name}</p>
                </div>
                <button onClick={() => setShowAnamnesisForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {anamnesisQuestions.map((q, idx) => (
                  <Input
                    key={idx}
                    label={q}
                    value={anamnesisAnswers[q] || ''}
                    onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, [q]: e.target.value })}
                  />
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setShowAnamnesisForm(false)}>Cancelar</Button>
                <Button onClick={() => handleSaveAnamnesis()} className="gap-2"><Save size={16} /> Salvar Anamnese</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Novo Paciente */}
      <AnimatePresence>
        {showNewPatientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Novo Paciente</h3>
                  <p className="text-sm text-slate-500">Cadastre um novo paciente na clínica.</p>
                </div>
                <button onClick={() => setShowNewPatientModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Nome Completo"
                  placeholder="Ex: Maria Oliveira"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                />
                <Input
                  label="Telefone / WhatsApp"
                  placeholder="Ex: (11) 99999-9999"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                />
                <div>
                  <Select
                    label="Status"
                    value={newPatientForm.status}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, status: e.target.value })}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </Select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setShowNewPatientModal(false)}>Cancelar</Button>
                <Button onClick={() => handleSaveNewPatient()}>Salvar Paciente</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
