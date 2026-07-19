import React, { useEffect, useState } from 'react';
import { Logo } from '../brand/Logo';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Trigger fade out before complete
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 800); // Allow fade out animation to finish
          }, 400);
          return 100;
        }
        // Random incremental steps for natural feel
        const increment = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-all duration-1000 ease-in-out ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Premium background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[80%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse duration-[6s]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Glowing ripple background rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border border-indigo-500/15 animate-ping opacity-20" style={{ animationDuration: '4.5s' }} />
        </div>

        {/* Brand logo block with dynamic entrance */}
        <div className="animate-in zoom-in-95 fade-in duration-1000 ease-out flex flex-col items-center mb-10">
          <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/40 shadow-2xl shadow-teal-500/5 hover:scale-105 transition-transform duration-500">
            <Logo size={96} showText={false} />
          </div>
          
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 drop-shadow-sm">
            Neurorobi
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-teal-400/80">
            IoT Clinical Toy Platform
          </p>
        </div>

        {/* Progress bar container */}
        <div className="w-64 bg-slate-900/80 border border-slate-800/40 rounded-full h-2 overflow-hidden p-[2px] shadow-inner mb-4">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading status info messages */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-[11px] font-medium tracking-wide text-slate-400 animate-pulse">
            {progress < 25 && 'Iniciando sistema de telemetría...'}
            {progress >= 25 && progress < 55 && 'Cargando registros clínicos y sensores...'}
            {progress >= 55 && progress < 85 && 'Estableciendo canal seguro con ESP32-Toy...'}
            {progress >= 85 && progress < 100 && 'Sincronizando base de datos en Neon DB...'}
            {progress === 100 && '¡Sistema Neurorobi Listo!'}
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-8 z-10 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
        Acción Social Cuenca © 2026
      </div>
    </div>
  );
};
