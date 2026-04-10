import { Filter, Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Select } from '../../ui/elements/Select';

const PAYABLES = [
  { id: 1, dueDate: '2026-03-28', description: 'Aluguel Sala 402', category: 'Fixa', value: 3500.00, status: 'pending' },
  { id: 2, dueDate: '2026-03-25', description: 'Dental Cremer - Luvas e Máscaras', category: 'Materiais', value: 850.40, status: 'paid' },
  { id: 3, dueDate: '2026-04-05', description: 'Energia Elétrica', category: 'Fixa', value: 420.15, status: 'pending' },
];

export const AccountsPayable = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-2">
          <Select className="w-40 h-9 text-xs">
            <option>Todos os Status</option>
            <option>Pendentes</option>
            <option>Pagos</option>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Filter size={14} /> Filtros
          </Button>
        </div>
        <Button size="sm" className="gap-2 h-9 bg-red-600 hover:bg-red-700 shadow-sm">
          <Plus size={16} /> Nova Despesa
        </Button>
      </div>

      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Vencimento</th>
            <th className="px-6 py-4">Descrição</th>
            <th className="px-6 py-4">Categoria</th>
            <th className="px-6 py-4">Valor</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {PAYABLES.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
              <td className="px-6 py-4 text-xs">{item.category}</td>
              <td className="px-6 py-4 font-bold text-red-600">
                - R$ {item.value.toFixed(2).replace('.', ',')}
              </td>
              <td className="px-6 py-4">
                {item.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                    <CheckCircle2 size={12} /> Pago
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase">
                    <Clock size={12} /> Pendente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
