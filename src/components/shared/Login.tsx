import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      setIsLoading(false);
      
      if (success) {
        onSuccess();
      } else {
        setError('Credenciales incorrectas. Verifique su correo y contraseña.');
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 600);
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error de conexión con el servidor.');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900 overflow-auto font-sans p-4">
      {/* Background glowing mesh colors */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-teal-600/20 blur-[130px] animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600/20 blur-[130px] animate-pulse duration-[8s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      {/* Main card */}
      <div
        className={`relative w-full max-w-md z-10 transition-all duration-500 ${
          shouldShake ? 'animate-bounce' : ''
        }`}
        style={{
          animationIterationCount: shouldShake ? '2' : 'unset',
          animationDuration: shouldShake ? '0.2s' : 'unset'
        }}
      >
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg mb-4 hover:scale-105 transition-transform duration-500">
              <Logo size={56} showText={false} />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight text-center">
              Acceso Clínico
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1 text-center">
              Neurorobi — Centro de Psicología
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/25 rounded-2xl p-4 flex items-start gap-3 text-rose-200 text-xs font-bold leading-relaxed mb-6">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/65 border border-white/5 text-white placeholder-slate-500 text-sm focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/65 border border-white/5 text-white placeholder-slate-500 text-sm focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-6 font-semibold">
            Solicite sus credenciales al administrador del sistema
          </p>
        </div>
      </div>
    </div>
  );
};
