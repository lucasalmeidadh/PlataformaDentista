import React, { useState, useEffect } from 'react';
import { Shield, Building, CreditCard, Clock, ClipboardList, Plus, Trash2, CalendarRange, Edit2, Check, X, Search } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Modal } from '../../ui/elements/Modal';
import tipoAgendamentoService from '../../services/tipoAgendamentoService';
import type { TipoAgendamento } from '../../core/domain/tipoAgendamento';
import { type Procedure } from '../../constants/procedures';
import { useProcedures } from '../../hooks/useProcedures';

export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('usuarios');

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
        </div>
      </div>
    </div>
  );
};
