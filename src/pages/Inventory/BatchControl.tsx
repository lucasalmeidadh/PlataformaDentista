import { AlertCircle, Calendar, Clock, AlertTriangle, Edit2 } from 'lucide-react';

const BATCHES = [
  { id: 101, product: 'Anestésico Lidocaína', brand: 'DFL', batch: '20240315-A', expiryDate: '2026-04-10', quantity: 12, unit: 'tubetes', productId: 1 },
  { id: 102, product: 'Anestésico Lidocaína', brand: 'DFL', batch: '20240320-B', expiryDate: '2026-08-30', quantity: 12, unit: 'tubetes', productId: 1 },
  { id: 201, product: 'Toxina Botulínica 100u', brand: 'Botox', batch: 'TX-9872', expiryDate: '2026-03-30', quantity: 3, unit: 'frascos', productId: 2 },
  { id: 301, product: 'Resina Composta A2', brand: '3M', batch: 'RES-001', expiryDate: '2025-12-20', quantity: 15, unit: 'seringas', productId: 3 },
];

export const BatchControl = ({ onEdit }: { onEdit: (p: any) => void }) => {
  const today = new Date();
  
  const getStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Vencido', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
    if (diffDays <= 30) return { label: 'Vence em breve', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
    return { label: 'Válido', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Calendar };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-800">Controle de Validade por Lote</h2>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Válido
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Vence em breve
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Vencido
          </div>
        </div>
      </div>

      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Produto</th>
            <th className="px-6 py-4">Lote</th>
            <th className="px-6 py-4">Validade</th>
            <th className="px-6 py-4 text-center">Quantidade</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right pr-10">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {BATCHES.map(item => {
            const status = getStatus(item.expiryDate);
            const StatusIcon = status.icon;
            
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-xs">
                  <div className="font-medium text-slate-900">{item.product}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.brand}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] select-all">
                    {item.batch}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">
                  {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-center text-xs">
                  <span className="font-semibold">{item.quantity}</span> {item.unit}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${status.bg} ${status.color} font-medium text-[10px]`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </div>
                </td>
                <td className="px-6 py-4 text-right pr-6 text-xs">
                  <button 
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                    title="Editar produto pai"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {BATCHES.some(b => new Date(b.expiryDate) < today) && (
        <div className="bg-red-50 p-3 border-t border-red-100 flex items-center gap-3 text-red-800 text-[11px]">
          <AlertTriangle className="text-red-500 shrink-0" size={16} />
          <div>
            <span className="font-bold">Atenção:</span> Existem produtos vencidos. Retire do estoque imediatamente.
          </div>
        </div>
      )}
    </div>
  );
};
