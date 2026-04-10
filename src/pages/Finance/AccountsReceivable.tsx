import { Filter, Plus, Calendar, CheckCircle2, Clock, Search } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';

const RECEIVABLES = [
  { id: 1, date: '2026-03-24', patient: 'Ana Paula Santos', service: 'Implante Dentário', value: 2500.00, method: 'Cartão de Crédito', status: 'pending' },
  { id: 2, date: '2026-03-22', patient: 'Lucas Oliveira', service: 'Limpeza e Profilaxia', value: 250.00, method: 'PIX', status: 'paid' },
  { id: 3, date: '2026-03-20', patient: 'Beatriz Silva', service: 'Aparelho Ortodôntico', value: 1500.00, method: 'Boleto', status: 'pending' },
];

export const AccountsReceivable = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input placeholder="Buscar paciente..." className="pl-9 h-9 text-xs" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Filter size={14} /> Filtros
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus size={16} /> Nova Receita
          </Button>
        </div>
      </div>

      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Previsão</th>
            <th className="px-6 py-4">Paciente</th>
            <th className="px-6 py-4">Serviço/Origem</th>
            <th className="px-6 py-4">Forma</th>
            <th className="px-6 py-4">Valor</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {RECEIVABLES.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">{item.patient}</td>
              <td className="px-6 py-4 text-xs">{item.service}</td>
              <td className="px-6 py-4 text-xs">{item.method}</td>
              <td className="px-6 py-4 font-bold text-emerald-600">
                + R$ {item.value.toFixed(2).replace('.', ',')}
              </td>
              <td className="px-6 py-4">
                {item.status === 'paid' ? (
                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                    <CheckCircle2 size={12} /> Recebido
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
