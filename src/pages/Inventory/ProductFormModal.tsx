import { Modal } from '../../ui/elements/Modal';
import { Input } from '../../ui/elements/Input';
import { Select } from '../../ui/elements/Select';
import { Button } from '../../ui/elements/Button';
import { DollarSign, Package, Hash, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; 
}

export const ProductFormModal = ({ isOpen, onClose, product }: ProductFormModalProps) => {
  const isEditing = !!product;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Gerenciar Produto' : 'Novo Produto'}
      description={isEditing ? `Editando ${product.name}` : 'Cadastre um novo item e seus lotes.'}
      width="max-w-3xl"
    >
      <div className="flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 1. Cadastro Geral do Produto */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package size={14} /> Dados Gerais do Produto
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome do Produto</label>
                <Input defaultValue={product?.name} placeholder="Ex: Anestésico Lidocaína" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Marca / Fabricante</label>
                <Input defaultValue={product?.brand} placeholder="Ex: DFL, 3M" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
                <Select defaultValue={product?.category}>
                  <option value="Anestésicos">Anestésicos</option>
                  <option value="Estética">Estética</option>
                  <option value="Dentística">Dentística</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Estoque Mínimo</label>
                <div className="relative">
                   <ShieldAlert size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <Input type="number" defaultValue={product?.minQuantity} className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Unidade</label>
                <Select defaultValue={product?.unit}>
                  <option value="tubetes">Tubetes</option>
                  <option value="frascos">Frascos</option>
                  <option value="seringas">Seringas</option>
                </Select>
              </div>
            </div>
          </section>

          {/* 2. Gestão de Lotes (Hierarquia) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Hash size={14} /> Lotes em Estoque
              </h4>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <Plus size={14} /> Adicionar Lote
              </Button>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2">Nº do Lote</th>
                    <th className="px-4 py-2">Validade</th>
                    <th className="px-4 py-2 text-center">Quantidade</th>
                    <th className="px-4 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(product?.batches || [{ id: 'new', number: '', expiryDate: '', quantity: 0 }]).map((batch: any) => (
                    <tr key={batch.id} className="bg-white hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Input defaultValue={batch.number} className="h-8 text-xs font-mono" placeholder="Lote" />
                      </td>
                      <td className="px-4 py-3">
                        <Input defaultValue={batch.expiryDate} type="date" className="h-8 text-xs" />
                      </td>
                      <td className="px-4 py-3">
                        <Input defaultValue={batch.quantity} type="number" className="h-8 text-xs text-center w-20 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Financeiro (Preços base do produto) */}
          <section className="space-y-4 pb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} /> Definições Financeiras
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Preço de Custo (Médio)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                  <Input type="number" defaultValue={product?.costPrice} className="pl-9" placeholder="0,00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Preço de Venda Sugerido</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                  <Input type="number" defaultValue={product?.salePrice} className="pl-9" placeholder="0,00" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={onClose} className="bg-teal-600 hover:bg-teal-700 px-8 shadow-soft">
            {isEditing ? 'Salvar Tudo' : 'Cadastrar Produto'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
