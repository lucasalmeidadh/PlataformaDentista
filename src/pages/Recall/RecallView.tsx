import { useState } from 'react';
import { Bell, Clock, Send, Users, Activity } from 'lucide-react';
import { Button } from '../../ui/elements/Button';

const RECALL_PATIENTS = [
  { id: 1, name: 'Lucas Ferreira', lastVisit: '10/08/2025', procedure: 'Limpeza (Profilaxia)', status: 'Pendente' },
  { id: 2, name: 'Fernanda Costa', lastVisit: '05/09/2025', procedure: 'Restauração', status: 'Contatado' },
  { id: 3, name: 'Roberto Lima', lastVisit: '12/07/2025', procedure: 'Clareamento', status: 'Agendou' },
];

export const RecallView = () => {
  const [d1Active, setD1Active] = useState(true);
  const [d0Active, setD0Active] = useState(false);
  const [sixMonthsActive, setSixMonthsActive] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automações & Recall</h1>
          <p className="text-sm text-slate-500">Aumente o faturamento trazendo pacientes de volta à clínica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Painel de Automações */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-teal-600" /> Gatilhos de WhatsApp
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5"><Clock size={16} className="text-slate-400" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Lembrete D-1</h3>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-0.5">Envia mensagem 24h antes pedindo confirmação de presença.</p>
                </div>
              </div>
              <button 
                onClick={() => setD1Active(!d1Active)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${d1Active ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${d1Active ? 'translate-x-2' : '-translate-x-2'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5"><Bell size={16} className="text-slate-400" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Lembrete D-0</h3>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-0.5">Envia mensagem 2h antes da consulta.</p>
                </div>
              </div>
              <button 
                onClick={() => setD0Active(!d0Active)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${d0Active ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${d0Active ? 'translate-x-2' : '-translate-x-2'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5"><Users size={16} className="text-slate-400" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Retorno (6 meses)</h3>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-0.5">Adiciona na lista de Recall após 6 meses da última visita.</p>
                </div>
              </div>
              <button 
                onClick={() => setSixMonthsActive(!sixMonthsActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${sixMonthsActive ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sixMonthsActive ? 'translate-x-2' : '-translate-x-2'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* CRM Recall */}
        <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-white shadow-soft flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Fila de Retorno (CRM)</h2>
            <Button size="sm" className="h-8 text-xs gap-2">
              <Send size={14} /> Disparar Lote
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 uppercase font-medium text-[11px] tracking-wider sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Última Visita</th>
                  <th className="px-6 py-4">Procedimento</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECALL_PATIENTS.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-rose-600 font-medium">{p.lastVisit}</td>
                    <td className="px-6 py-4">{p.procedure}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-[4px] border ${
                        p.status === 'Agendou' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.status === 'Contatado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                        Contatar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
