import { Plus, Phone, Mail, ShoppingCart, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/elements/Button';

const SUPPLIERS = [
  { id: 1, name: 'Dental Cremer', contact: 'Maria Vitoria', phone: '(11) 98765-4321', email: 'vendas@dentalcremer.com.br', category: 'Geral' },
  { id: 2, name: 'Dental Speed', contact: 'Ricardo Goulart', phone: '(11) 91234-5678', email: 'vendas@dentalspeed.com.br', category: 'Geral' },
  { id: 3, name: 'Allergan Brasil', contact: 'Atendimento Corp', phone: '0800 123 456', email: 'pedidos@allergan.com', category: 'Estética' },
];

const LOW_STOCK_ITEMS = [
  { id: 2, name: 'Toxina Botulínica 100u', current: 3, min: 5, unit: 'frascos', lastPrice: 1250.00, suggestedSupplier: 'Allergan Brasil' },
  { id: 5, name: 'Luvas de Procedimento (M)', current: 2, min: 10, unit: 'caixas', lastPrice: 45.00, suggestedSupplier: 'Dental Cremer' },
];

export const SuppliersView = () => {
  return (
    <div className="space-y-8">
      {/* Alertas de Compra Automática */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="text-teal-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Sugestões de Compra (Reposição)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LOW_STOCK_ITEMS.map(item => (
            <div key={item.id} className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-600">
                    Estoque: <span className="font-bold text-red-600">{item.current}</span> / Min: {item.min} {item.unit}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">Fornecedor sugerido: {item.suggestedSupplier}</p>
                </div>
              </div>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2 shadow-sm text-xs h-9">
                Gerar Pedido
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de Fornecedores */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Phone className="text-teal-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Fornecedores Cadastrados</h2>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus size={16} /> Novo Fornecedor
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Telefone / E-mail</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SUPPLIERS.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{s.name}</div>
                  </td>
                  <td className="px-6 py-4">{s.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="text-slate-400" /> {s.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={12} className="text-slate-400" /> {s.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-teal-600 transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
