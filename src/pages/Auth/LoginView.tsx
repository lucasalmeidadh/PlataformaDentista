import { useState } from 'react';
import { Mail, Lock, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/elements/Button';
import { Input } from '../../ui/elements/Input';
import authService from '../../services/authService';

export const LoginView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-slate-50 relative">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-teal-700">
          <HeartPulse size={28} strokeWidth={2.5} />
          <span className="font-semibold text-lg tracking-tight">Clínica Leme</span>
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bem-vindo de volta
            </h1>
            <p className="text-slate-500">
              Acesse a plataforma de gerenciamento clínico.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  label="E-mail" 
                  placeholder="seu@email.com" 
                  required 
                  className="pl-10 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-[34px] text-slate-400" size={18} />
              </div>
              
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  label="Senha" 
                  placeholder="••••••••" 
                  required 
                  className="pl-10 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-[34px] text-slate-400" size={18} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                Lembrar-me
              </label>
              <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Entrar na Conta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 pt-6">
            Não tem uma conta? <a href="#" className="font-medium text-teal-600 hover:text-teal-700">Entre em contato</a>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 bg-teal-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90" />
        
        {/* Elemento decorativo base */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-teal-400 rounded-full opacity-10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-teal-800/50 backdrop-blur-sm rounded-2xl border border-teal-700/50 mb-4 text-teal-100 shadow-xl">
             <HeartPulse size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Cuidado focado no paciente
          </h2>
          <p className="text-teal-100/80 text-lg leading-relaxed font-light">
            Uma plataforma de agendamento pensada para simplificar a rotina da sua clínica e focar no que mais importa: a saúde de quem confia em você.
          </p>
        </div>
      </div>
    </div>
  );
};
