import { motion } from 'framer-motion';
import { Share2, Printer, CheckCircle2, DollarSign, Calendar, User, FileText, ChevronLeft } from 'lucide-react';
import { Button } from '../../ui/elements/Button';

interface BudgetViewProps {
  patient: any;
  treatments: any[];
  onBack: () => void;
  onApprove: (total: number) => void;
  onSaveDraft: (total: number) => void;
}

export const BudgetView = ({ patient, treatments, onBack, onApprove, onSaveDraft }: BudgetViewProps) => {
  const total = treatments.reduce((sum, item) => sum + item.price, 0);
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Header / Ações */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-medium transition-colors"
        >
          <ChevronLeft size={20} /> Voltar ao Odontograma
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-white">
            <Printer size={16} /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-white">
            <Share2 size={16} /> Compartilhar (WhatsApp)
          </Button>
        </div>
      </div>

      <div className="p-8 md:p-12 overflow-y-auto">
        {/* Document Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ORÇAMENTO</h1>
            <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-xs">Plano de Tratamento Odontológico</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Clinica Sorriso Real</p>
            <p className="text-xs text-slate-400 mt-1">CNPJ: 00.000.000/0001-00</p>
            <p className="text-xs text-slate-400">(11) 4002-8922</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-teal-600" /> Dados do Paciente
            </h3>
            <div>
              <p className="text-sm font-bold text-slate-800">{patient.name}</p>
              <p className="text-xs text-slate-500 mt-1">{patient.phone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-teal-600" /> Detalhes do Documento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Data de Emissão</p>
                <p className="text-xs font-bold text-slate-700">{today}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Nº Orçamento</p>
                <p className="text-xs font-bold text-slate-700">ORD-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Treatments Table */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-teal-600" /> Descritivo de Procedimentos
          </h3>
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Região/Dente</th>
                  <th className="px-6 py-4">Procedimento</th>
                  <th className="px-6 py-4">Faces</th>
                  <th className="px-6 py-4 text-right">Valor Unit.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treatments.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">Dente {t.tooth}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{t.procedure}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {t.faces?.join(', ') || 'Completo'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      R$ {t.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td colSpan={3} className="px-6 py-6 font-bold uppercase tracking-widest text-xs">Investimento Total</td>
                  <td className="px-6 py-6 text-right text-xl font-black">
                    R$ {total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <DollarSign size={16} /> Condições de Pagamento
            </h4>
            <div className="space-y-3 text-sm text-emerald-900">
              <p className="flex justify-between">
                <span>À vista (PIX/Dinheiro - 5% desc)</span>
                <span className="font-bold">R$ {(total * 0.95).toFixed(2)}</span>
              </p>
              <p className="flex justify-between border-t border-emerald-200/50 pt-3">
                <span>Cartão (Até 10x s/ juros)</span>
                <span className="font-bold">10x R$ {(total / 10).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Observações</h4>
            <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 italic">
              <li>Este orçamento é válido por 30 dias após a data de emissão.</li>
              <li>O início do tratamento está condicionado ao aceite deste plano.</li>
              <li>Valores sujeitos a alteração em caso de mudança na complexidade clínica.</li>
            </ul>
          </div>
        </div>

        {/* Approval Footer */}
        <div className="flex flex-col items-center gap-6 py-12 border-t border-dashed border-slate-200">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">O paciente deseja aprovar este orçamento?</h2>
            <p className="text-sm text-slate-500 mt-2">Ao aprovar, as parcelas serão lançadas no seu financeiro automaticamente.</p>
          </div>
          <div className="flex gap-4">
             <Button 
               variant="outline" 
               className="px-8 border-slate-300 transition-all hover:bg-slate-50"
               onClick={() => onSaveDraft(total)}
             >
               Salvar Apenas Rascunho
             </Button>
             <Button 
               className="px-12 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20 gap-2"
               onClick={() => onApprove(total)}
             >
               <CheckCircle2 size={18} /> Aprovar e Finalizar
             </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
