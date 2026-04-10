import { useState } from 'react';
import { Search, Send, User, Bot, Phone, MoreVertical } from 'lucide-react';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';

const CHATS = [
  { id: 1, name: 'João Silva', time: '10:42', preview: 'Vou chegar 10 min atrasado.', unread: 2, status: 'human' },
  { id: 2, name: 'Maria Souza', time: 'Ontem', preview: 'Bot: Seu agendamento foi...', unread: 0, status: 'bot' },
  { id: 3, name: 'Pedro Alves', time: 'Ontem', preview: 'Qual o valor do clareamento?', unread: 0, status: 'human' },
];

export const MessagesView = () => {
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const [botPaused, setBotPaused] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden">
      
      {/* Sidebar de Chats */}
      <div className="w-1/3 min-w-[300px] border-r border-slate-200 flex flex-col bg-slate-50 relative">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input 
              placeholder="Buscar paciente ou número" 
              className="pl-9 h-9 text-sm bg-slate-100 border-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CHATS.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-100
                ${activeChat.id === chat.id ? 'bg-teal-50' : 'hover:bg-slate-100 bg-white'}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User size={20} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-900 truncate">{chat.name}</span>
                  <span className="text-xs text-slate-500">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500 truncate">{chat.preview}</p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={18} className="text-slate-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{activeChat.name}</h3>
              <p className="text-xs text-slate-500">Paciente desde Fev 2026</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium">
              <span className={`w-2 h-2 rounded-full ${botPaused ? 'bg-amber-500' : 'bg-teal-500'}`} />
              {botPaused ? 'Atendimento Humano' : 'Bot Ativo'}
              
              <button 
                onClick={() => setBotPaused(!botPaused)}
                className="ml-2 text-xs text-teal-600 hover:text-teal-700 underline"
              >
                {botPaused ? 'Retomar Bot' : 'Pausar Bot'}
              </button>
            </div>
            
            <button className="text-slate-400 hover:text-slate-600"><Phone size={20} /></button>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-center">
            <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
              Hoje
            </span>
          </div>

          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
               <User size={14} className="text-slate-500" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
              <p className="text-slate-900 text-sm">Olá, gostaria de confirmar minha consulta amanhã.</p>
              <span className="text-[10px] text-slate-400 mt-1 block">10:40</span>
            </div>
          </div>

          <div className="flex gap-3 max-w-[80%] ml-auto justify-end">
            <div className="bg-teal-50 p-3 rounded-2xl rounded-tr-none shadow-sm border border-teal-100 relative group">
              <div className="absolute -left-6 top-1 opacity-100">
                <Bot size={16} className="text-teal-600" />
              </div>
              <p className="text-slate-900 text-sm">Olá! Sua consulta está confirmada para amanhã às 14:00 com a Dra. Ana. Aguardamos você!</p>
              <span className="text-[10px] text-teal-600 mt-1 block text-right">10:41</span>
            </div>
          </div>
          
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
               <User size={14} className="text-slate-500" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
              <p className="text-slate-900 text-sm">Vou chegar 10 min atrasado. Tem problema?</p>
              <span className="text-[10px] text-slate-400 mt-1 block">10:42</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Input 
              placeholder={botPaused ? "Digite uma mensagem..." : "Pause o bot para responder..."}
              className="flex-1"
              disabled={!botPaused}
            />
            <Button disabled={!botPaused} className="px-3 shrink-0">
              <Send size={18} />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
