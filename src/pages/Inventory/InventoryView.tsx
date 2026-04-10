import { useState } from 'react';
import { Package, AlertTriangle, Calendar, Search, Plus, Filter, Users, Edit2 } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import { BatchControl } from './BatchControl';
import { SuppliersView } from './SuppliersView';
import { ProductFormModal } from './ProductFormModal';

type Tab = 'stock' | 'batches' | 'suppliers';

export const InventoryView = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="text-sm text-slate-500">Gerenciamento de materiais, lotes e fornecedores.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Search size={16} /> Consultar
          </Button>
          <Button className="gap-2" onClick={handleAdd}>
            <Plus size={16} /> Novo Produto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'stock' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} />
            Estoque Atual
          </div>
          {activeTab === 'stock' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'batches' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            Lotes e Validade
          </div>
          {activeTab === 'batches' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'suppliers' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Fornecedores
          </div>
          {activeTab === 'suppliers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'stock' && <StockList onEdit={handleEdit} />}
        {activeTab === 'batches' && <BatchControl onEdit={handleEdit} />}
        {activeTab === 'suppliers' && <SuppliersView />}
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
      />
    </div>
  );
};

const StockList = ({ onEdit }: { onEdit: (p: any) => void }) => {
  const stockItems = [
    { 
      id: 1, 
      name: 'Anestésico Lidocaína', 
      brand: 'DFL', 
      category: 'Anestésicos', 
      unit: 'tubetes', 
      minQuantity: 10,
      costPrice: 45.00, 
      salePrice: 120.00,
      batches: [
        { id: 101, number: '20240315-A', expiryDate: '2026-04-10', quantity: 12 },
        { id: 102, number: '20240320-B', expiryDate: '2026-08-30', quantity: 12 }
      ]
    },
    { 
      id: 2, 
      name: 'Toxina Botulínica 100u', 
      brand: 'Botox', 
      category: 'Estética', 
      unit: 'frascos', 
      minQuantity: 5,
      costPrice: 1100.00, 
      salePrice: 2800.00,
      batches: [
        { id: 201, number: 'TX-9872', expiryDate: '2026-03-30', quantity: 3 }
      ]
    },
    { 
      id: 3, 
      name: 'Resina Composta A2', 
      brand: '3M', 
      category: 'Dentística', 
      unit: 'seringas', 
      minQuantity: 8,
      costPrice: 85.00, 
      salePrice: 190.00,
      batches: [
        { id: 301, number: 'RES-001', expiryDate: '2025-12-20', quantity: 15 }
      ]
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input placeholder="Buscar no estoque..." className="pl-10 text-sm" />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter size={14} /> Filtros
        </Button>
      </div>

      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Produto</th>
            <th className="px-6 py-4">Marca</th>
            <th className="px-6 py-4">Categoria</th>
            <th className="px-6 py-4 text-center">Qtd</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right pr-8">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stockItems.map(item => {
            const totalQuantity = item.batches.reduce((acc, b) => acc + b.quantity, 0);
            
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                <td className="px-6 py-4">{item.brand}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold text-slate-600 uppercase">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold">{totalQuantity}</span> {item.unit}
                </td>
                <td className="px-6 py-4">
                  {totalQuantity <= item.minQuantity ? (
                    <div className="flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                      <AlertTriangle size={14} />
                      Estoque Baixo
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Em Estoque
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right pr-6">
                  <button 
                    onClick={() => onEdit(item)}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
