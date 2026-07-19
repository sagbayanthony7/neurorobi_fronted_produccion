import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Heart, Brain, Sparkles, Shield } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

// Quick-access profiles for development/testing
const quickProfiles = [
  {
    email: 'psicologia@neurorobi.com',
    password: 'psicologia2026',
    label: 'Psicología Clínica',
    name: 'Dra. María López',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-400/30',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    text: 'text-rose-300',
    glow: 'shadow-rose-500/20'
  },
  {
    email: 'educacion@neurorobi.com',
    password: 'educacion2026',
    label: 'Educación Especial',
    name: 'Lic. Carlos Méndez',
    icon: Brain,
    gradient: 'from-indigo-500 to-violet-600',
    border: 'border-indigo-400/30',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    text: 'text-indigo-300',
    glow: 'shadow-indigo-500/20'
  },
  {
    email: 'fisioterapia@neurorobi.com',
    password: 'fisioterapia2026',
    label: 'Fisioterapia',
    name: 'Ftr. Ana Salazar',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20'
  }
];

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);

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
        setError('Las credenciales ingresadas son incorrectas o no están autorizadas.');
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 600);
      }
    } catch (err) {
      setIsLoading(false);
      setError('Ocurrió un error de conexión con el servidor.');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    }
  };

  // Quick login as a specific profile
  const handleQuickLogin = async (profile: typeof quickProfiles[0]) => {
    setError(null);
    setLoadingProfile(profile.email);

    try {
      const success = await login(profile.email, profile.password);
      setLoadingProfile(null);

      if (success) {
        onSuccess();
      } else {
        setError(`No se pudo iniciar sesión como ${profile.label}. Verifique que el backend esté corriendo.`);
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 600);
      }
    } catch (err) {
      setLoadingProfile(null);
      setError('Error de conexión con el servidor. ¿Está el backend corriendo en el puerto 3001?');
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
        <div className="absolute top-[30%] right-[20%] h-[40%] w-[40%] rounded-full bg-rose-600/10 blur-[120px] animate-pulse duration-[12s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      </div>

      {/* Main card wrapper */}
      <div
        className={`relative w-full max-w-2xl z-10 transition-all duration-500 ${
          shouldShake ? 'animate-bounce' : ''
        }`}
        style={{
          animationIterationCount: shouldShake ? '2' : 'unset',
          animationDuration: shouldShake ? '0.2s' : 'unset'
        }}
      >
        {/* Glassmorphic Container Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg mb-4 hover:scale-105 transition-transform duration-500">
              <Logo size={64} showText={false} />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight text-center">
              Acceso Clínico Neurorobi
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1 text-center">
              Plataforma IoT — Centro de Psicología · Acción Social Cuenca
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/25 rounded-2xl p-4 flex items-start gap-3 text-rose-200 text-xs font-bold leading-relaxed mb-6">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ═══════════ Quick Profile Selector ═══════════ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                Seleccionar Perfil Terapéutico
              </span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickProfiles.map((profile) => {
                const Icon = profile.icon;
                const isThisLoading = loadingProfile === profile.email;

                return (
                  <button
                    key={profile.email}
                    onClick={() => handleQuickLogin(profile)}
                    disabled={!!loadingProfile}
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border ${profile.border} ${profile.bg} transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-xl ${profile.glow}`}></div>

                    {/* Icon */}
                    <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center shadow-lg ${profile.glow}`}>
                      {isThisLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Icon size={22} className="text-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="relative text-center">
                      <h4 className="text-xs font-extrabold text-white leading-tight">
                        {profile.label}
                      </h4>
                      <p className={`text-[10px] font-semibold mt-1 ${profile.text}`}>
                        {profile.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════════ Manual Login Toggle ═══════════ */}
          <div className="border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer py-2"
            >
              <Shield size={14} />
              {showManualLogin ? 'Ocultar Login Manual' : 'Login Manual con Credenciales'}
            </button>

            {showManualLogin && (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">

                {/* Email input field */}
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
                      placeholder="ejemplo@correo.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/65 border border-white/5 text-white placeholder-slate-500 text-sm focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                {/* Password input field */}
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
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/65 border border-white/5 text-white placeholder-slate-500 text-sm focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
