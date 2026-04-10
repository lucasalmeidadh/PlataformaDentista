import { Calendar, Users, Settings, LogOut, Package, DollarSign, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../elements/Button'; // Reusing cn utility

const navItems = [
  { icon: Calendar, label: 'Agenda', to: '/dashboard/agenda' },
  { icon: Users, label: 'Pacientes', to: '/dashboard/pacientes' },
  { icon: Package, label: 'Estoque', to: '/dashboard/estoque' },
  { icon: DollarSign, label: 'Financeiro', to: '/dashboard/financeiro' },
  { icon: FileText, label: 'Relatórios', to: '/dashboard/relatorios' },
  { icon: Settings, label: 'Configurações', to: '/dashboard/configuracoes' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 flex flex-col min-h-screen text-slate-300 transition-all duration-300 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white shadow-soft">
            L
          </div>
          <span className="font-semibold text-lg tracking-tight">Clínica Leme</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
                isActive
                  ? 'bg-teal-600 text-white shadow-soft'
                  : 'hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon size={20} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
};
