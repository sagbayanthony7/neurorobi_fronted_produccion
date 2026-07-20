import React, { useState, useMemo } from 'react';
import { usePatients } from '../context/PatientContext';
import { RegisterPatientModal } from '../components/forms/RegisterPatientModal';
import { EditPatientModal } from '../components/forms/EditPatientModal';
import { imageUrl } from '../utils/imageUrl';
import { formatDate } from '../utils/formatDate';
import { 
  Search, 
  User, 
  Plus,
  Edit2, 
  Trash2, 
  Play, 
  Calendar, 
  History, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Printer,
  Filter,
  BarChart3,
  X
} from 'lucide-react';
import { PrintReportModal } from '../components/shared/PrintReportModal';
import { SessionDetailModal } from '../components/shared/SessionDetailModal';
import type { Patient, ClinicalSession } from '../types';

interface PatientManagementProps {
  onStartSessionSuccess: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  onStartSessionSuccess,
  onShowSuccessToast
}) => {
  const { 
    patients, 
    sessions, 
    deletePatient, 
    startSession 
  } = usePatients();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedSessionForPrint, setSelectedSessionForPrint] = useState<ClinicalSession | null>(null);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<ClinicalSession | null>(null);

  // Session filter states
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterSpecialist, setFilterSpecialist] = useState<string>('ALL');

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  // (Edit state now lives in EditPatientModal)

  // Delete States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  // Filter patients by search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleStartSession = (patientId: string, name: string) => {
    startSession(patientId);
    onShowSuccessToast(`✓ Sesión terapéutica iniciada para ${name}`);
    onStartSessionSuccess();
  };

  const handleRegistrationSuccess = (name: string) => {
    onShowSuccessToast(`✓ Paciente "${name}" registrado exitosamente`);
    setIsRegisterModalOpen(false);
    // Select the newly registered patient if possible
    if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  };

  // Edit mode: now handled by EditPatientModal
  const startEditMode = () => setIsEditing(true);
  const handleEditSuccess = (msg: string) => {
    onShowSuccessToast(msg);
    setIsEditing(false);
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    const name = selectedPatient.name;
    const success = await deletePatient(selectedPatient.id);
    if (success) {
      onShowSuccessToast(`✓ Expediente de ${name} eliminado correctamente`);
      setShowDeleteConfirm(false);
      // Select next available patient
      const remaining = patients.filter(p => p.id !== selectedPatient.id);
      if (remaining.length > 0) {
        setSelectedPatientId(remaining[0].id);
      } else {
        setSelectedPatientId(null);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'PSICÓLOGO' || role === 'PSICOLOGIA_CLINICA') return <Heart size={12} className="text-rose-500" fill="currentColor" />;
    if (role === 'NEURÓLOGO' || role === 'NEUROLOGIA') return <Brain size={12} className="text-indigo-500" />;
    return <Sparkles size={12} className="text-emerald-500" />;
  };

  // Filter sessions for the selected patient, then apply date + specialist filters
  const patientSessions = useMemo(() => {
    let result = sessions.filter(s => s.patientId === selectedPatientId);

    if (filterDateFrom) {
      const fromTime = new Date(filterDateFrom + 'T00:00:00').getTime();
      if (!isNaN(fromTime)) {
        result = result.filter(s => new Date(s.date).getTime() >= fromTime);
      }
    }
    if (filterDateTo) {
      const toTime = new Date(filterDateTo + 'T23:59:59').getTime();
      if (!isNaN(toTime)) {
        result = result.filter(s => new Date(s.date).getTime() <= toTime);
      }
    }
    if (filterSpecialist !== 'ALL') {
      result = result.filter(s => s.specialistRole === filterSpecialist);
    }

    return result;
  }, [sessions, selectedPatientId, filterDateFrom, filterDateTo, filterSpecialist]);

  const hasActiveFilters = filterDateFrom !== '' || filterDateTo !== '' || filterSpecialist !== 'ALL';

  const clearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterSpecialist('ALL');
  };

  return (
    <div className="space-y-6 animate-all duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión del Expediente Clínico</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Administrar, editar y auditar historias clínicas infantiles</p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-600/10 hover:shadow-teal-700/20 active:scale-98 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          Registrar Paciente
        </button>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Patient Catalog List */}
        <div className="lg:col-span-1 flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden max-h-[400px] md:max-h-[550px]">
          
          <div className="p-4 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Directorio Clínico</h3>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-xs text-slate-400 font-medium">No se encontraron pacientes.</p>
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = p.id === selectedPatientId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={`w-full text-left p-4 transition-all flex items-center justify-between gap-3 border-l-4 ${
                      isSelected 
                        ? 'bg-teal-50/40 border-teal-600 text-teal-900' 
                        : 'border-transparent text-slate-700 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 overflow-hidden rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {p.profileImageUrl ? (
                          <img src={imageUrl(p.profileImageUrl)} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <User size={15} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{p.diagnosis}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={isSelected ? "text-teal-600" : "text-slate-300"} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMNS: Patient Details Card */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedPatient ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col h-full space-y-6">
              
              {/* Patient Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                <div className="flex items-center gap-4">
                  {selectedPatient.profileImageUrl ? (
                    <img 
                      src={imageUrl(selectedPatient.profileImageUrl)}
                      alt={`Foto de ${selectedPatient.name}`}
                      className="h-12 w-12 rounded-xl object-cover shadow-xs border border-slate-100"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold shadow-xs">
                      <User size={22} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      {selectedPatient.name}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {selectedPatient.age} años
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">
                        {selectedPatient.diagnosis}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={10} /> Registro: {formatDate(selectedPatient.registeredAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartSession(selectedPatient.id, selectedPatient.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] uppercase tracking-wide shadow-xs active:scale-98 transition-all cursor-pointer"
                  >
                    <Play size={10} />
                    Iniciar Sesión
                  </button>
                </div>
              </div>

              {/* View Mode */}
              <div className="space-y-6 flex-1">
                  
                  {/* Diagnosis & Observations Card */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-4">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Observación Inicial del Terapeuta</h4>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white border border-slate-100/50 rounded-lg p-3 shadow-xs">
                        {selectedPatient.initialObservation || "Sin observaciones iniciales registradas."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Clínico</h5>
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            selectedPatient.status === 'En Sesión' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : selectedPatient.status === 'Sesión Completada'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {selectedPatient.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID de Expediente</h5>
                        <p className="text-xs text-slate-500 font-mono mt-1 truncate">{selectedPatient.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={startEditMode}
                      className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-teal-100 cursor-pointer"
                    >
                      <Edit2 size={13} />
                      Editar Datos
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-rose-100 cursor-pointer ml-auto"
                    >
                      <Trash2 size={13} />
                      Eliminar Paciente
                    </button>
                  </div>

                  {/* Delete Confirmation Drawer */}
                  {showDeleteConfirm && (
                    <div className="border border-rose-100 bg-rose-50/50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-rose-800">¿Confirmar eliminación del paciente?</h5>
                          <p className="text-[11px] text-rose-600 leading-normal font-medium">
                            Esta acción es irreversible. Se eliminará el expediente de <span className="font-bold">{selectedPatient.name}</span> junto con todas sus sesiones grabadas y datos de telemetría de forma permanente.
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleDeletePatient}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all shadow-xs cursor-pointer"
                            >
                              Sí, eliminar permanentemente
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historical Sessions Sublist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <History size={14} className="text-slate-400" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Sesiones Clínicas de este Paciente</h4>
                    </div>

                    {/* Filters Row */}
                    {sessions.filter(s => s.patientId === selectedPatientId).length > 0 && (
                      <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 shrink-0">
                          <Filter size={12} />
                          Filtros:
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Desde</label>
                            <input
                              type="date"
                              value={filterDateFrom}
                              onChange={(e) => setFilterDateFrom(e.target.value)}
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Hasta</label>
                            <input
                              type="date"
                              value={filterDateTo}
                              onChange={(e) => setFilterDateTo(e.target.value)}
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Especialista</label>
                            <select
                              value={filterSpecialist}
                              onChange={(e) => setFilterSpecialist(e.target.value)}
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 cursor-pointer"
                            >
                              <option value="ALL">Todos</option>
                              <option value="PSICOLOGIA_CLINICA">Psicología Clínica</option>
                              <option value="EDUCACION_ESPECIAL">Educación Especial</option>
                              <option value="FISIOTERAPIA">Fisioterapia</option>
                            </select>
                          </div>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-all border border-transparent hover:border-rose-100 mt-auto cursor-pointer"
                            >
                              <X size={11} />
                              Limpiar
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {patientSessions.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
                        <p className="text-[11px] text-slate-400 font-medium">
                          {hasActiveFilters
                            ? 'No se encontraron sesiones con los filtros seleccionados.'
                            : 'Este paciente aún no registra sesiones de consulta.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {/* Desktop table */}
                        <table className="w-full text-left text-xs border-collapse hidden md:table">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                              <th className="pb-2">Fecha</th>
                              <th className="pb-2">Especialista</th>
                              <th className="pb-2">Dispositivo</th>
                              <th className="pb-2">Duración</th>
                              <th className="pb-2">Métricas</th>
                              <th className="pb-2 text-right pr-2">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {patientSessions.map(sess => (
                              <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 font-semibold text-slate-600">{formatDate(sess.date)}</td>
                                <td className="py-2.5 font-bold text-slate-700">
                                  <span className="flex items-center gap-1 text-[11px]">
                                    {getRoleIcon(sess.specialistRole)}
                                    {sess.specialistRole.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 text-slate-500 uppercase text-[11px] font-bold">{sess.deviceType === 'oso' ? 'Oso' : 'Pulsera'}</td>
                                <td className="py-2.5 font-medium text-slate-500">{sess.durationSeconds}s</td>
                                <td className="py-2.5">
                                  <div className="flex gap-1 text-[10px] font-bold uppercase">
                                    <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">FC {sess.metrics.avgHeartRate}</span>
                                    <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{sess.metrics.comfortIndex}%</span>
                                  </div>
                                </td>
                                <td className="py-2.5 text-right pr-2">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => setSelectedSessionForDetail(sess)}
                                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide border border-transparent hover:border-indigo-100"
                                    >
                                      <BarChart3 size={12} />
                                      Gráfica
                                    </button>
                                    <button
                                      onClick={() => setSelectedSessionForPrint(sess)}
                                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide border border-transparent hover:border-teal-100"
                                    >
                                      <Printer size={12} />
                                      Reporte
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-3">
                          {patientSessions.map(sess => (
                            <div key={sess.id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-800">{formatDate(sess.date)}</span>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">{sess.deviceType === 'oso' ? 'Oso' : 'Pulsera'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                <span className="flex items-center gap-1">{getRoleIcon(sess.specialistRole)}{sess.specialistRole.replace('_', ' ')}</span>
                                <span className="text-slate-300">·</span>
                                <span>{sess.durationSeconds}s</span>
                              </div>
                              <div className="flex gap-1 text-[10px] font-bold uppercase">
                                <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">FC {sess.metrics.avgHeartRate}</span>
                                <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{sess.metrics.comfortIndex}%</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedSessionForDetail(sess)}
                                  className="flex-1 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase border border-slate-100 hover:border-indigo-200"
                                >
                                  <BarChart3 size={12} />
                                  Gráfica
                                </button>
                                <button
                                  onClick={() => setSelectedSessionForPrint(sess)}
                                  className="flex-1 py-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase border border-slate-100 hover:border-teal-200"
                                >
                                  <Printer size={12} />
                                  Reporte
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[200px] md:min-h-[400px]">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <User size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">Sin Expediente Seleccionado</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Seleccione un paciente de la lista del directorio para administrar sus datos clínicos, ver el historial de sesiones o iniciar una nueva consulta.
                </p>
              </div>
            )}
          </div>

        </div>

      {/* MODAL: Register New Patient Form */}
      {isRegisterModalOpen && (
        <RegisterPatientModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* MODAL: Edit Patient Form */}
      {isEditing && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Print modal component */}
      <PrintReportModal
        isOpen={selectedSessionForPrint !== null}
        onClose={() => setSelectedSessionForPrint(null)}
        session={selectedSessionForPrint}
      />

      {/* Session Detail modal with charts */}
      <SessionDetailModal
        isOpen={selectedSessionForDetail !== null}
        onClose={() => setSelectedSessionForDetail(null)}
        session={selectedSessionForDetail!}
      />

    </div>
  );
};
