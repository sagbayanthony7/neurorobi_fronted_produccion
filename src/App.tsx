import React, { useState } from 'react';
import { PatientProvider } from './context/PatientContext';
import { RoleProvider } from './context/RoleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/shared/Sidebar';
import { TopBar } from './components/shared/TopBar';
import { Splash } from './components/shared/Splash';
import { Login } from './components/shared/Login';
import { PatientDirectory } from './pages/PatientDirectory';
import { LiveTelemetry } from './pages/LiveTelemetry';
import { PostSessionReport } from './pages/PostSessionReport';
import { PatientManagement } from './pages/PatientManagement';
import { TherapistManagement } from './pages/TherapistManagement';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}


const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setScreen] = useState<'directory' | 'patients' | 'telemetry' | 'report' | 'therapists'>('directory');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show customized floating toast alerts
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Autoclose after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => showToast('¡Bienvenido al panel Neurorobi!', 'success')} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased relative">
      
      {/* Overlay backdrop for mobile menu */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 1. Global Premium Sidebar Navigation */}
      <Sidebar 
        currentScreen={currentScreen} 
        setScreen={setScreen} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Workstation Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Controls bar */}
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Screen Viewport Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          
          <div className="max-w-7xl mx-auto transition-all duration-500 ease-in-out">
            
            {/* Screen 1: Patient Directory */}
            {currentScreen === 'directory' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PatientDirectory 
                  onStartSessionSuccess={() => setScreen('telemetry')}
                  onShowSuccessToast={(msg) => showToast(msg, 'success')}
                  onNavigate={(screen) => setScreen(screen)}
                />
              </div>
            )}

            {/* Screen 1B: Patient Management */}
            {currentScreen === 'patients' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PatientManagement 
                  onStartSessionSuccess={() => setScreen('telemetry')}
                  onShowSuccessToast={(msg) => showToast(msg, 'success')}
                />
              </div>
            )}

            {/* Screen 2: Real-time telemetry monitoring */}
            {currentScreen === 'telemetry' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LiveTelemetry 
                  onEndSessionSuccess={() => setScreen('report')}
                  onShowSuccessToast={(msg) => {
                    const isSpike = msg.includes('⚠️');
                    showToast(msg, isSpike ? 'warning' : 'success');
                  }}
                />
              </div>
            )}

            {/* Screen 3: Post-session Analytical report */}
            {currentScreen === 'report' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PostSessionReport 
                  onArchiveSuccess={() => setScreen('directory')}
                  onShowSuccessToast={(msg) => showToast(msg, 'success')}
                  onShowErrorToast={(msg) => showToast(msg, 'warning')}
                />
              </div>
            )}

            {/* Screen 4: Therapist Management (Admin only) */}
            {currentScreen === 'therapists' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TherapistManagement 
                  onShowToast={(msg, type = 'success') => showToast(msg, type)}
                />
              </div>
            )}

          </div>

        </main>
      </div>

      {/* 3. Floating Clinical Toast Notifications Panel */}
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 flex flex-col gap-2.5 max-w-sm w-auto sm:w-full pointer-events-none">
        {toasts.map((toast) => {
          
          let cardStyle = "pointer-events-auto w-full p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-500 animate-in slide-in-from-right-10 ";
          
          if (toast.type === 'warning') {
            cardStyle += "bg-rose-50 border-rose-100 text-rose-800 shadow-rose-100/40";
          } else if (toast.type === 'info') {
            cardStyle += "bg-indigo-50 border-indigo-100 text-indigo-800 shadow-indigo-100/40";
          } else {
            cardStyle += "bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-100/40";
          }

          return (
            <div key={toast.id} className={cardStyle}>
              
              <div className="flex-1 text-xs font-bold leading-normal">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 shrink-0 self-start p-2 rounded-lg hover:bg-black/5 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={14} />
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <PatientProvider>
          <AppContent />
        </PatientProvider>
      </RoleProvider>
    </AuthProvider>
  );
}
