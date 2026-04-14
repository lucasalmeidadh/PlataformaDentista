import React, { useState, useEffect } from 'react';
import { Shield, Building, CreditCard, Clock, ClipboardList, Plus, Trash2, CalendarRange, Edit2, Check, X, Search, Zap, ArrowRight, MessageSquare, RefreshCw, Bell, ToggleLeft } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Modal } from '../../ui/elements/Modal';
import tipoAgendamentoService from '../../services/tipoAgendamentoService';
import type { TipoAgendamento } from '../../core/domain/tipoAgendamento';
import { type Procedure } from '../../constants/procedures';
import { useProcedures } from '../../hooks/useProcedures';

// ── Tipos de Automação ────────────────────────────────────────────────────────
interface Automation {
  id: string;
  title: string;
  description: string;
  triggerLabel: string;
  triggerIcon: 'clock' | 'calendar' | 'refresh' | 'bell';
  actionLabel: string;
  message: string;
  isActive: boolean;
  runCount: number;
  lastRun?: string;
}

const TRIGGER_OPTIONS = [
  { value: '24h_before',   label: '24h antes do agendamento',      icon: 'clock' as const,    example: 'Olá {{nome}}, lembramos que você tem consulta amanhã às {{hora}} com {{dentista}}. Confirme respondendo SIM.' },
  { value: '2h_before',    label: '2h antes do agendamento',       icon: 'clock' as const,    example: 'Olá {{nome}}! Sua consulta é hoje às {{hora}}. Estamos te esperando! 📍 {{endereco}}' },
  { value: 'after',        label: 'Após finalizar atendimento',    icon: 'calendar' as const, example: 'Olá {{nome}}, obrigado pela visita! Como foi seu atendimento hoje com {{dentista}}? Qualquer dúvida estamos à disposição.' },
  { value: '3m_no_return', label: '3 meses sem retorno do paciente', icon: 'refresh' as const, example: 'Olá {{nome}}! Faz um tempo que não te vemos por aqui. Que tal agendar uma consulta de rotina? 😊' },
  { value: 'birthday',     label: 'Aniversário do paciente',        icon: 'bell' as const,    example: 'Feliz aniversário, {{nome}}! 🎉 A equipe {{clinica}} deseja um dia especial para você!' },
  { value: '7d_overdue',   label: '7 dias com saldo devedor',       icon: 'clock' as const,   example: 'Olá {{nome}}, identificamos um saldo pendente de R$ {{valor}}. Entre em contato para regularizar. 😊' },
];

const VARIABLES = ['{{nome}}', '{{hora}}', '{{data}}', '{{dentista}}', '{{clinica}}', '{{endereco}}', '{{valor}}'];

const DEFAULT_AUTOMATIONS: Automation[] = [
  { id: 'a1', title: 'Confirmação de Consulta', description: 'Envia mensagem de confirmação 24h antes do agendamento.', triggerLabel: '24h antes do agendamento', triggerIcon: 'clock', actionLabel: 'Enviar WhatsApp', message: 'Olá {{nome}}, lembramos que você tem consulta amanhã às {{hora}} com {{dentista}}. Confirme respondendo SIM.', isActive: true, runCount: 38, lastRun: 'Há 2 horas' },
  { id: 'a2', title: 'Lembrete no Dia',         description: 'Envia lembrete com endereço 2h antes da consulta.',     triggerLabel: '2h antes do agendamento',  triggerIcon: 'clock', actionLabel: 'Enviar WhatsApp', message: 'Olá {{nome}}! Sua consulta é hoje às {{hora}}. Estamos te esperando! 📍 {{endereco}}', isActive: false, runCount: 0 },
  { id: 'a3', title: 'Pós-Consulta',           description: 'Mensagem de satisfação após finalizar o atendimento.',  triggerLabel: 'Após finalizar atendimento', triggerIcon: 'calendar', actionLabel: 'Enviar WhatsApp', message: 'Olá {{nome}}, obrigado pela visita! Como foi seu atendimento hoje com {{dentista}}?', isActive: false, runCount: 0 },
  { id: 'a4', title: 'Recall de Pacientes',     description: 'Re-engaja pacientes que não retornam há 3 meses.',    triggerLabel: '3 meses sem retorno',      triggerIcon: 'refresh', actionLabel: 'Enviar WhatsApp', message: 'Olá {{nome}}! Faz um tempo que não te vemos. Que tal agendar uma consulta? 😊', isActive: false, runCount: 0 },
  { id: 'a5', title: 'Feliz Aniversário',      description: 'Envia mensagem especial no aniversário do paciente.',  triggerLabel: 'Aniversário do paciente', triggerIcon: 'bell', actionLabel: 'Enviar WhatsApp', message: 'Feliz aniversário, {{nome}}! 🎉 A equipe {{clinica}} deseja um dia especial para você!', isActive: false, runCount: 0 },
];

export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('usuarios');

  // Automations State
  const [automations, setAutomations] = useState<Automation[]>(DEFAULT_AUTOMATIONS);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [editingAuto, setEditingAuto] = useState<Automation | null>(null);
  const [autoStep, setAutoStep] = useState<1 | 2>(1);
  const [autoForm, setAutoForm] = useState({ triggerId: '', title: '', message: '' });

  // Anamnesis State
  const [anamnesisQuestions, setAnamnesisQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  // Tipo Agendamento State
  const [tiposAgendamento, setTiposAgendamento] = useState<TipoAgendamento[]>([]);
  const [isLoadingTipos, setIsLoadingTipos] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAgendamento | null>(null);
  const [newTipoDescricao, setNewTipoDescricao] = useState('');
  const [newTipoIsActive, setNewTipoIsActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Procedures State
  const { procedures, setProcedures } = useProcedures();
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [procedureForm, setProcedureForm] = useState<Partial<Procedure>>({
    name: '',
    price: 0,
    category: '',
    estimatedTime: 30
  });

  const fetchTiposAgendamento = async () => {
    setIsLoadingTipos(true);
    try {
      const data = await tipoAgendamentoService.buscarTodos();
      setTiposAgendamento(data);
    } catch (error) {
      console.error('Erro ao buscar tipos de agendamento:', error);
    } finally {
      setIsLoadingTipos(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tipos-agendamento') {
      fetchTiposAgendamento();
    }
  }, [activeTab]);

  useEffect(() => {
    const saved = localStorage.getItem('anamnesis_questions');
    if (saved) {
      setAnamnesisQuestions(JSON.parse(saved));
    } else {
      const defaultQs = ["Alergias Conhecidas", "Uso Contínuo de Medicamento", "Cirurgias Anteriores", "Histórico Familiar de Doenças"];
      setAnamnesisQuestions(defaultQs);
      localStorage.setItem('anamnesis_questions', JSON.stringify(defaultQs));
    }
  }, []);

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    const updated = [...anamnesisQuestions, newQuestion.trim()];
    setAnamnesisQuestions(updated);
    localStorage.setItem('anamnesis_questions', JSON.stringify(updated));
    setNewQuestion('');
  };

  const removeQuestion = (index: number) => {
    const updated = anamnesisQuestions.filter((_: string, i: number) => i !== index);
    setAnamnesisQuestions(updated);
    localStorage.setItem('anamnesis_questions', JSON.stringify(updated));
  };

  const handleCreateTipo = async () => {
    if (!newTipoDescricao.trim()) return;
    try {
      await tipoAgendamentoService.criar({
        descricao: newTipoDescricao,
        isActive: newTipoIsActive
      });
      setNewTipoDescricao('');
      setNewTipoIsActive(true);
      setIsModalOpen(false);
      fetchTiposAgendamento();
    } catch (error: any) {
      console.error('Erro ao criar tipo de agendamento:', error);
      alert('Erro ao criar: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleUpdateTipo = async () => {
    if (!editingTipo || !editingTipo.descricao.trim()) return;
    try {
      await tipoAgendamentoService.atualizar(editingTipo.id, {
        descricao: editingTipo.descricao,
        isActive: editingTipo.isActive
      });
      setEditingTipo(null);
      fetchTiposAgendamento();
    } catch (error) {
      console.error('Erro ao atualizar tipo de agendamento:', error);
    }
  };

  const handleDeleteTipo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de agendamento?')) return;
    try {
      await tipoAgendamentoService.excluir(id);
      fetchTiposAgendamento();
    } catch (error) {
      console.error('Erro ao excluir tipo de agendamento:', error);
    }
  };

  // Procedure Handlers
  const handleOpenProcedureModal = (proc?: Procedure) => {
    if (proc) {
      setEditingProcedure(proc);
      setProcedureForm(proc);
    } else {
      setEditingProcedure(null);
      setProcedureForm({ name: '', price: 0, category: '', estimatedTime: 30 });
    }
    setIsProcedureModalOpen(true);
  };

  const handleSaveProcedure = () => {
    if (!procedureForm.name) return;

    let updatedProcedures: Procedure[];
    if (editingProcedure) {
      updatedProcedures = procedures.map(p => p.id === editingProcedure.id ? { ...p, ...procedureForm } as Procedure : p);
    } else {
      const newProc: Procedure = {
        ...procedureForm,
        id: `p_${Date.now()}`
      } as Procedure;
      updatedProcedures = [newProc, ...procedures];
    }

    setProcedures(updatedProcedures);
    setIsProcedureModalOpen(false);
  };

  const handleDeleteProcedure = (id: string) => {
    if (!confirm('Excluir este procedimento?')) return;
    const updated = procedures.filter(p => p.id !== id);
    setProcedures(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-sm text-slate-500">Administre o sistema, acessos e faturamento.</p>
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Sidebar de Configurações */}
        <div className="w-64 shrink-0 flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Shield size={18} />
            Usuários e Permissões
          </button>

          <button
            onClick={() => setActiveTab('procedimentos')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'procedimentos' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Clock size={18} />
            Catálogo / Tempo Médio
          </button>

          <button
            onClick={() => setActiveTab('anamnese')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'anamnese' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <ClipboardList size={18} />
            Perguntas Anamnese
          </button>

          <button
            onClick={() => setActiveTab('tipos-agendamento')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tipos-agendamento' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <CalendarRange size={18} />
            Tipo de Agendamento
          </button>

          <button
            onClick={() => setActiveTab('automacoes')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'automacoes' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Zap size={18} />
            Automações
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Building size={18} />
            Dados da Clínica
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <CreditCard size={18} />
            Assinatura e Faturamento
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-soft p-6 overflow-y-auto">
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Membros da Equipe</h2>
                <Button size="sm" className="gap-2">
                  Novo Membro
                </Button>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center">LC</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Dra. Lucas Almeida</h4>
                    <p className="text-xs text-slate-500">Administrador / Dentista Chefe</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">Ativo</span>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center">RM</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Recepção Leme</h4>
                    <p className="text-xs text-slate-500">Recepcionista</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">Ativo</span>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procedimentos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Catálogo de Procedimentos</h2>
                  <p className="text-sm text-slate-500 mt-1">Gerencie preços e tempos de execução dos serviços.</p>
                </div>
                <Button size="sm" onClick={() => handleOpenProcedureModal()} className="gap-2">
                  <Plus size={16} /> Novo Procedimento
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar procedimento..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Procedimento</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Tempo de Cadeira</th>
                      <th className="px-6 py-4">Valor Base</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procedures
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(proc => (
                        <tr key={proc.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-800">{proc.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{proc.category || 'Geral'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 italic">{proc.estimatedTime} min</td>
                          <td className="px-6 py-4 font-bold text-teal-700">R$ {proc.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenProcedureModal(proc)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteProcedure(proc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {procedures.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhum procedimento encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Procedure Modal */}
              <Modal
                isOpen={isProcedureModalOpen}
                onClose={() => setIsProcedureModalOpen(false)}
                title={editingProcedure ? "Editar Procedimento" : "Novo Procedimento"}
                description="Preencha os dados do serviço e preço base."
              >
                <div className="p-6 space-y-4">
                  <Input 
                    label="Nome do Procedimento"
                    value={procedureForm.name}
                    onChange={(e) => setProcedureForm({...procedureForm, name: e.target.value})}
                    placeholder="Ex: Canal 2 Condutos"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Categoria"
                      value={procedureForm.category}
                      onChange={(e) => setProcedureForm({...procedureForm, category: e.target.value})}
                      placeholder="Ex: Endodontia"
                    />
                    <Input 
                      label="Tempo Estimado (min)"
                      type="number"
                      value={procedureForm.estimatedTime}
                      onChange={(e) => setProcedureForm({...procedureForm, estimatedTime: parseInt(e.target.value)})}
                      placeholder="30"
                    />
                  </div>
                  <Input 
                    label="Preço Base (R$)"
                    type="number"
                    value={procedureForm.price}
                    onChange={(e) => setProcedureForm({...procedureForm, price: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                  
                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 -mx-6 -mb-6 p-6 bg-slate-50 rounded-b-xl">
                    <Button variant="ghost" onClick={() => setIsProcedureModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveProcedure} className="bg-teal-600 hover:bg-teal-700">Salvar Alterações</Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}
          {activeTab === 'anamnese' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Perguntas da Anamnese</h2>
                  <p className="text-sm text-slate-500 mt-1">Defina o questionário de saúde padrão para todos os pacientes.</p>
                </div>
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="Nova Pergunta"
                    placeholder="Ex: Pratica atividades físicas?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                  />
                </div>
                <Button onClick={addQuestion} className="gap-2 mb-1">
                  <Plus size={18} /> Adicionar
                </Button>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {anamnesisQuestions.length === 0 ? (
                    <li className="p-4 text-center text-slate-500 text-sm">Nenhuma pergunta cadastrada.</li>
                  ) : (
                    anamnesisQuestions.map((q: string, idx: number) => (
                      <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <span className="text-sm text-slate-700 font-medium">{q}</span>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover pergunta"
                        >
                          <Trash2 size={18} />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'tipos-agendamento' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Tipo de Agendamento</h2>
                  <p className="text-sm text-slate-500 mt-1">Gerencie os diferentes tipos de agendamentos disponíveis.</p>
                </div>
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 bottom-2.5 text-slate-400" size={18} />
                  <Input
                    label="Buscar"
                    placeholder="Buscar tipo de agendamento..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Plus size={18} /> Adicionar
                </Button>
              </div>


              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingTipos ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Carregando...</td>
                      </tr>
                    ) : tiposAgendamento.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Nenhum tipo de agendamento cadastrado.</td>
                      </tr>
                    ) : tiposAgendamento.filter(tipo => tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Nenhum tipo de agendamento encontrado para "{searchTerm}".</td>
                      </tr>
                    ) : (
                      tiposAgendamento
                        .filter(tipo => tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((tipo) => (
                          <tr key={tipo.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              {editingTipo && editingTipo.id === tipo.id ? (
                                <Input
                                  value={editingTipo.descricao}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTipo({ ...editingTipo, descricao: e.target.value })}
                                  className="h-8"
                                />
                              ) : (
                                <span className="font-medium text-slate-900">{tipo.descricao}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingTipo && editingTipo.id === tipo.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editingTipo.isActive}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTipo({ ...editingTipo, isActive: e.target.checked })}
                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                  />
                                  <span className="text-xs">{editingTipo.isActive ? 'Ativo' : 'Inativo'}</span>
                                </div>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${tipo.isActive ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {tipo.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                              )}
                            </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {editingTipo && editingTipo.id === tipo.id ? (
                                <>
                                  <button
                                    onClick={handleUpdateTipo}
                                    className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                                    title="Salvar"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={() => setEditingTipo(null)}
                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                    title="Cancelar"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingTipo(tipo)}
                                    className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTipo(tipo.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Tipo de Agendamento"
                description="Insira os dados para o novo tipo de agendamento."
              >
                <div className="p-6 space-y-5">
                  <Input
                    label="Descrição"
                    placeholder="Ex: Primeira Consulta, Retorno, Urgência"
                    value={newTipoDescricao}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTipoDescricao(e.target.value)}
                    required
                  />

                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      id="isActiveModal"
                      checked={newTipoIsActive}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTipoIsActive(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="isActiveModal" className="text-sm font-medium text-slate-700">Ativo</label>
                  </div>

                  <div className="p-4 pt-6 border-t border-slate-100 flex justify-end gap-3 -mx-6 -mb-6 bg-slate-50 rounded-b-xl">
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTipo}>
                      Salvar Tipo de Agendamento
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}
          {activeTab === 'automacoes' && (() => {
            const openCreate = () => {
              setEditingAuto(null);
              setAutoForm({ triggerId: '', title: '', message: '' });
              setAutoStep(1);
              setIsAutoModalOpen(true);
            };
            const openEdit = (a: Automation) => {
              setEditingAuto(a);
              setAutoForm({ triggerId: '', title: a.title, message: a.message });
              setAutoStep(2);
              setIsAutoModalOpen(true);
            };
            const toggleAuto = (id: string) => {
              setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
            };
            const deleteAuto = (id: string) => {
              if (!confirm('Excluir esta automação?')) return;
              setAutomations(prev => prev.filter(a => a.id !== id));
            };
            const saveAuto = () => {
              const trigger = TRIGGER_OPTIONS.find(t => t.value === autoForm.triggerId);
              if (!trigger || !autoForm.title || !autoForm.message) return;
              if (editingAuto) {
                setAutomations(prev => prev.map(a => a.id === editingAuto.id
                  ? { ...a, title: autoForm.title, message: autoForm.message, triggerLabel: trigger.label, triggerIcon: trigger.icon }
                  : a));
              } else {
                setAutomations(prev => [{
                  id: `a${Date.now()}`, title: autoForm.title, description: trigger.label,
                  triggerLabel: trigger.label, triggerIcon: trigger.icon,
                  actionLabel: 'Enviar WhatsApp', message: autoForm.message,
                  isActive: false, runCount: 0
                }, ...prev]);
              }
              setIsAutoModalOpen(false);
            };

            const TriggerIcon = ({ icon }: { icon: string }) => {
              if (icon === 'refresh') return <RefreshCw size={16} className="text-teal-600" />;
              if (icon === 'bell')    return <Bell size={16} className="text-amber-500" />;
              if (icon === 'calendar') return <CalendarRange size={16} className="text-indigo-500" />;
              return <Clock size={16} className="text-teal-600" />;
            };

            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Automações</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure mensagens automáticas de WhatsApp para seus pacientes.</p>
                  </div>
                  <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-teal-600/20"
                  >
                    <Plus size={16} /> Nova Automação
                  </button>
                </div>

                {/* Cards de automação */}
                <div className="space-y-3">
                  {automations.map(auto => (
                    <div
                      key={auto.id}
                      className={`border rounded-xl p-4 transition-all ${
                        auto.isActive
                          ? 'border-teal-200 bg-teal-50/30 shadow-sm'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            auto.isActive ? 'bg-teal-100' : 'bg-slate-100'
                          }`}>
                            <Zap size={17} className={auto.isActive ? 'text-teal-600' : 'text-slate-400'} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">{auto.title}</h4>
                              {auto.isActive && (
                                <span className="text-[10px] font-bold bg-teal-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Ativo</span>
                              )}
                              {auto.runCount > 0 && (
                                <span className="text-[10px] font-semibold text-slate-400">{auto.runCount} disparos</span>
                              )}
                            </div>

                            {/* Pipeline: gatilho → ação */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                                <TriggerIcon icon={auto.triggerIcon} />
                                {auto.triggerLabel}
                              </div>
                              <ArrowRight size={14} className="text-slate-300 shrink-0" />
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                                <MessageSquare size={14} className="text-green-500" />
                                {auto.actionLabel}
                              </div>
                            </div>

                            {/* Prévia da mensagem */}
                            <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">✉ &ldquo;{auto.message}&rdquo;</p>
                            {auto.lastRun && (
                              <p className="text-[10px] text-slate-400 mt-1">Último disparo: {auto.lastRun}</p>
                            )}
                          </div>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openEdit(auto)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteAuto(auto.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                          {/* Toggle */}
                          <button
                            onClick={() => toggleAuto(auto.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                              auto.isActive ? 'bg-teal-500' : 'bg-slate-200'
                            }`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                              auto.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {automations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                        <Zap size={26} className="text-teal-400" />
                      </div>
                      <h3 className="font-bold text-slate-700">Nenhuma automação criada</h3>
                      <p className="text-sm text-slate-400 mt-1">Crie sua primeira automação para economizar tempo.</p>
                    </div>
                  )}
                </div>

                {/* Modal de criação / edição */}
                {isAutoModalOpen && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden">
                      {/* Header */}
                      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
                        <div>
                          <h3 className="font-bold text-slate-900">{editingAuto ? 'Editar Automação' : 'Nova Automação'}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {autoStep === 1 ? 'Passo 1 de 2 — Escolha o gatilho' : 'Passo 2 de 2 — Configure a mensagem'}
                          </p>
                        </div>
                        <button onClick={() => setIsAutoModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                          <X size={18} />
                        </button>
                      </div>

                      <div className="p-6">
                        {/* Step 1: Gatilho */}
                        {autoStep === 1 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700 mb-3">Quando Esta Automação Deve Disparar?</p>
                            {TRIGGER_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAutoForm(f => ({ ...f, triggerId: opt.value, message: opt.example, title: f.title || opt.label }))}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                                  autoForm.triggerId === opt.value
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  autoForm.triggerId === opt.value ? 'bg-teal-500' : 'bg-slate-100'
                                }`}>
                                  <Zap size={15} className={autoForm.triggerId === opt.value ? 'text-white' : 'text-slate-500'} />
                                </div>
                                <span className={`text-sm font-medium ${
                                  autoForm.triggerId === opt.value ? 'text-teal-700' : 'text-slate-700'
                                }`}>{opt.label}</span>
                                {autoForm.triggerId === opt.value && (
                                  <div className="ml-auto w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Step 2: Mensagem */}
                        {autoStep === 2 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Automação</label>
                              <input
                                type="text"
                                value={autoForm.title}
                                onChange={e => setAutoForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Ex: Confirmação de Consulta"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mensagem do WhatsApp</label>
                              <textarea
                                rows={5}
                                value={autoForm.message}
                                onChange={e => setAutoForm(f => ({ ...f, message: e.target.value }))}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                                placeholder="Olá {{nome}}, sua consulta é amanhã..."
                              />
                            </div>
                            {/* Chips de variáveis */}
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Variáveis disponíveis</p>
                              <div className="flex flex-wrap gap-2">
                                {VARIABLES.map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => setAutoForm(f => ({ ...f, message: f.message + v }))}
                                    className="text-xs font-mono bg-slate-100 hover:bg-teal-100 hover:text-teal-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 hover:border-teal-300"
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => { if (autoStep === 2 && !editingAuto) setAutoStep(1); else setIsAutoModalOpen(false); }}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {autoStep === 2 && !editingAuto ? '← Voltar' : 'Cancelar'}
                        </button>
                        <button
                          type="button"
                          disabled={autoStep === 1 ? !autoForm.triggerId : !autoForm.title || !autoForm.message}
                          onClick={() => { if (autoStep === 1) setAutoStep(2); else saveAuto(); }}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                        >
                          {autoStep === 1 ? <><ArrowRight size={15} /> Próximo</> : <><Check size={15} /> Salvar Automação</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};
