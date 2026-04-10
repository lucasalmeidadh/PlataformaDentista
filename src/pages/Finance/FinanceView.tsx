import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Download, Plus, LayoutDashboard, Receipt, TrendingUp } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Select } from '../../ui/elements/Select';
import { AccountsPayable } from './AccountsPayable';
import { AccountsReceivable } from './AccountsReceivable';

const TRANSACTIONS = [
  { id: 1, date: '19/03/2026', description: 'João Silva - Clareamento', type: 'in', value: 850.00, method: 'PIX' },
  { id: 2, date: '18/03/2026', description: 'Dental Cremer - Materiais', type: 'out', value: 1240.50, method: 'Boleto' },
  { id: 3, date: '18/03/2026', description: 'Maria Souza - Manutenção', type: 'in', value: 120.00, method: 'Cartão de Crédito' },
];

type Tab = 'overview' | 'payable' | 'receivable';

export const FinanceView = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500">Acompanhe as receitas e despesas da clínica.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Exportar
          </Button>
          <Button className="gap-2">
            <Plus size={16} /> Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Cards de Resumo - Sempre Visíveis para contexto rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Saldo Atual</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">R$ 12.450,00</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <DollarSign className="text-teal-600" size={20} />
            </div>
          </div>
          <div className="text-sm">
            <span className="text-emerald-600 font-medium">+15%</span>
            <span className="text-slate-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Entradas (Mês)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">R$ 28.320,00</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ArrowUpRight className="text-emerald-600" size={20} />
            </div>
          </div>
          <div className="text-sm">
            <span className="text-emerald-600 font-medium">+8%</span>
            <span className="text-slate-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Saídas (Mês)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">R$ 15.870,00</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <ArrowDownRight className="text-red-600" size={20} />
            </div>
          </div>
          <div className="text-sm">
            <span className="text-amber-600 font-medium">-2%</span>
            <span className="text-slate-500 ml-2">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'overview' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Extrato Geral
          </div>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('payable')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'payable' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt size={18} />
            Contas a Pagar
          </div>
          {activeTab === 'payable' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('receivable')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'receivable' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            Contas a Receber
          </div>
          {activeTab === 'receivable' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-soft flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Últimas Movimentações</h2>
              <Select className="w-40 border-slate-200">
                <option>Março / 2026</option>
                <option>Fevereiro / 2026</option>
              </Select>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Método</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRANSACTIONS.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{t.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                      <td className="px-6 py-4">{t.method}</td>
                      <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'in' ? '+' : '-'} R$ {t.value.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'payable' && <AccountsPayable />}
        {activeTab === 'receivable' && <AccountsReceivable />}
      </div>
    </div>
  );
};
