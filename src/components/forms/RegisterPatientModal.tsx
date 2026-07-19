import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { RegisterPatientForm } from './RegisterPatientForm';

interface RegisterPatientModalProps {
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({ onClose, onSuccess }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Scrollable body */}
        <div className="max-h-[90vh] overflow-y-auto">
          <RegisterPatientForm onSuccess={onSuccess} />
        </div>
      </div>
    </div>,
    document.body
  );
};
