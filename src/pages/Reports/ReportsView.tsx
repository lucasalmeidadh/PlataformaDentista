import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Printer,
  Calendar
} from 'lucide-react';
import { Button } from '../../ui/elements/Button';

type ReportCategory = 'financeiro' | 'administrativo' | 'estoque';

export const ReportsView = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');

  const categories = [
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'administrativo', label: 'Administrativo', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'estoque', label: 'Estoque', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-teal-600" size={28} /> Central de Relatórios
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Inteligência de dados para o crescimento da sua clínica.</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as ReportCategory)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            activeCategory === cat.id 
                            ? `${cat.bg} ${cat.color} shadow-sm` 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden pb-4">
        {/* Sidebar de Relatórios Específicos */}
        <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Relatórios Disponíveis</h3>
            {activeCategory === 'financeiro' && (
                <>
                    <ReportMenuItem label="Fluxo de Caixa Mensal" description="Entradas e saídas consolidadas." active />
                    <ReportMenuItem label="DRE Simplificada" description="Resultado líquido do período." />
                    <ReportMenuItem label="Inadimplência" description="Pacientes com parcelas em atraso." />
                    <ReportMenuItem label="Impostos e Taxas de Cartão" description="Custo operacional financeiro." />
                </>
            )}
            {activeCategory === 'administrativo' && (
                <>
                    <ReportMenuItem label="Conversão de Orçamentos" description="% de planos aprovados vs criados." active />
                    <ReportMenuItem label="Produtividade por Dentista" description="Procedimentos realizados por profissional." />
                    <ReportMenuItem label="Absenteísmo (Faltas)" description="Taxa de não comparecimento." />
                    <ReportMenuItem label="Ticket Médio" description="Valor médio gasto por paciente." />
                </>
            )}
            {activeCategory === 'estoque' && (
                <>
                    <ReportMenuItem label="Curva ABC de Materiais" description="Itens que mais impactam o custo." active />
                    <ReportMenuItem label="Consumo por Procedimento" description="Quanto de material cada serviço gasta." />
                    <ReportMenuItem label="Relatório de Desperdício" description="Itens vencidos ou descartados." />
                </>
            )}
        </div>

        {/* Visualização de Report (MOCK DASHBOARDS) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-teal-600">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-white">
                        <Calendar size={14} /> Últimos 30 dias
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-white">
                        <Printer size={14} /> Exportar PDF
                    </Button>
                </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {activeCategory === 'financeiro' && <FinanceDashboardMock />}
                        {activeCategory === 'administrativo' && <AdminDashboardMock />}
                        {activeCategory === 'estoque' && <InventoryDashboardMock />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

const ReportMenuItem = ({ label, description, active = false }: { label: string, description: string, active?: boolean }) => (
    <button className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between group ${
        active 
        ? 'bg-white border-teal-200 shadow-md ring-1 ring-teal-500/10' 
        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'
    }`}>
        <div>
            <p className={`text-sm font-bold ${active ? 'text-teal-700' : 'text-slate-700'}`}>{label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{description}</p>
        </div>
        <ChevronRight size={16} className={`transition-transform group-hover:translate-x-0.5 ${active ? 'text-teal-500' : 'text-slate-300'}`} />
    </button>
);

const FinanceDashboardMock = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPI simple label="Faturamento Bruto" value="R$ 42.500" trend="+12%" up />
            <KPI simple label="Ticket Médio" value="R$ 1.250" trend="+5%" up />
            <KPI simple label="Margem Líquida" value="68%" trend="-2%" />
        </div>
        
        <div className="grid grid-cols-2 gap-6 h-64">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Faturamento por Tipo</h4>
                <div className="flex-1 flex items-end gap-3 px-4">
                    <Bar h={80} label="Pix" color="bg-teal-500" />
                    <Bar h={40} label="CC" color="bg-blue-500" />
                    <Bar h={20} label="Boleto" color="bg-slate-300" />
                    <Bar h={10} label="Din." color="bg-slate-400" />
                </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Fluxo de Caixa (Semanal)</h4>
                <div className="w-full h-32 relative">
                    {/* Simulated SVG Line Chart */}
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                        <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,20" fill="none" stroke="#0d9488" strokeWidth="3" />
                        <circle cx="100" cy="50" r="4" fill="#0d9488" />
                        <circle cx="200" cy="30" r="4" fill="#0d9488" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
);

const AdminDashboardMock = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-slate-800">Taxa de Conversão</h4>
                    <div className="text-3xl font-black text-blue-600 mt-2">72.4%</div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Planos vs Aprovações</p>
                </div>
                <div className="w-20 h-20 rounded-full border-[6px] border-blue-50 border-t-blue-500 flex items-center justify-center font-bold text-blue-600 text-sm">72%</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-slate-800">Absenteísmo (Faltas)</h4>
                    <div className="text-3xl font-black text-rose-600 mt-2">4.2%</div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Média do mês atual</p>
                </div>
                <div className="w-20 h-20 rounded-full border-[6px] border-rose-50 border-t-rose-500 flex items-center justify-center font-bold text-rose-600 text-sm">Low</div>
            </div>
       </div>

       <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Produtividade por Procedimento</h4>
           <div className="space-y-4">
                <ProgressRow label="Clínica Geral" percent={85} value="92" color="bg-blue-500" />
                <ProgressRow label="Ortodontia" percent={60} value="47" color="bg-teal-500" />
                <ProgressRow label="Endodontia" percent={30} value="12" color="bg-purple-500" />
           </div>
       </div>
    </div>
);

const InventoryDashboardMock = () => (
    <div className="space-y-6">
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                <Package size={32} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-amber-900">Itens Próximos do Vencimento</h4>
                <p className="text-sm text-amber-700/70">Você possui <strong>4 lotes</strong> que vencem nos próximos 15 dias.</p>
            </div>
            <Button size="sm" className="ml-auto bg-amber-600 hover:bg-amber-700 text-white border-none">Ver Itens</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Itens mais consumidos (Mês)</h4>
                <ul className="space-y-3">
                    <li className="flex justify-between text-sm py-2 border-b border-slate-50 italic">
                        <span className="text-slate-600">Luvas de Latéx (P)</span>
                        <span className="font-bold">22 caixas</span>
                    </li>
                    <li className="flex justify-between text-sm py-2 border-b border-slate-50 italic">
                        <span className="text-slate-600">Anestésico Lidocaína</span>
                        <span className="font-bold">14 frascos</span>
                    </li>
                    <li className="flex justify-between text-sm py-2 border-b border-slate-50 italic">
                        <span className="text-slate-600">Resina Z250 (A2)</span>
                        <span className="font-bold">8 tubos</span>
                    </li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Custo de Materiais (30d)</h4>
                <div className="h-40 flex items-center justify-center relative">
                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-50 border-t-amber-500 border-l-amber-200" />
                    <div className="absolute flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        <span className="text-lg font-black text-slate-800">R$ 2.8k</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const KPI = ({ label, value, trend, up = false, simple = false }: any) => (
  <div className={`p-6 rounded-2xl border transition-all ${simple ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-black text-slate-800 mt-2">{value}</p>
  </div>
);

const Bar = ({ h, label, color }: any) => (
    <div className="flex-1 flex flex-col items-center gap-2">
        <div className={`w-full rounded-t-lg ${color}`} style={{ height: `${h}%` }} />
        <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
);

const ProgressRow = ({ label, percent, value, color }: any) => (
    <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold">
            <span className="text-slate-600 uppercase tracking-widest">{label}</span>
            <span className="text-slate-900">{value} serv.</span>
        </div>
        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200/50">
            <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
        </div>
    </div>
);
