import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';

const mockPatients = [
  { id: '1', name: 'João Silva',   phone: '(11) 98765-4321', lastVisit: '15/03/2026', status: 'Ativo',   lastProcedure: 'Manutenção Aparelho' },
  { id: '2', name: 'Maria Souza',  phone: '(11) 91234-5678', lastVisit: '10/02/2026', status: 'Inativo', lastProcedure: 'Nenhum' },
  { id: '3', name: 'Pedro Alves',  phone: '(11) 99999-8888', lastVisit: '18/03/2026', status: 'Ativo',   lastProcedure: 'Avaliação Inicial' },
];

export const PatientsView = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(mockPatients);
  const [search, setSearch] = useState('');

  // Modal Novo Paciente
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', phone: '', status: 'Ativo' });

  const handleSaveNewPatient = () => {
    if (!newPatientForm.name.trim()) return;
    const newPatient = {
      id: `p${Date.now()}`,
      name: newPatientForm.name,
      phone: newPatientForm.phone,
      lastVisit: '-',
      status: newPatientForm.status,
      lastProcedure: 'Nenhum',
    };
    setPatients([newPatient, ...patients]);
    setNewPatientForm({ name: '', phone: '', status: 'Ativo' });
    setShowNewPatientModal(false);
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[calc(100vh-4rem)]"
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-sm text-slate-500">Gestão de prontuários, histórico e anamnese.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewPatientModal(true)}>
          <Plus size={18} /> Novo Paciente
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filtros Avançados</Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold sticky top-0 text-xs tracking-wide">
              <tr>
                <th className="px-6 py-4">Nome do Paciente</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Última Consulta</th>
                <th className="px-6 py-4">Último Procedimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{patient.phone}</td>
                    <td className="px-6 py-4">{patient.lastVisit}</td>
                    <td className="px-6 py-4 text-slate-500">{patient.lastProcedure}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/pacientes/${patient.id}`)}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                      >
                        Abrir Prontuário →
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <Select
                  label="Status"
                  value={newPatientForm.status}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, status: e.target.value })}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </Select>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <Button variant="outline" onClick={() => setShowNewPatientModal(false)}>Cancelar</Button>
                <Button onClick={handleSaveNewPatient}>Salvar Paciente</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
