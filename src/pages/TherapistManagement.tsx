import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Plus, Trash2, Edit3, X, Search, 
  Heart, Brain, Sparkles, Shield, 
  ChevronRight, UserPlus, ClipboardList
} from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://neurorobibackendproduccion-production.up.railway.app'}/api`;

interface Specialist {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImageUrl?: string | null;
  createdAt?: string;
  assignedPatients?: number;
  totalSessions?: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  assignments?: { specialistId: string }[];
  _count?: { sessions: number };
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ADMIN: { label: 'Administrador', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  PSICOLOGIA_CLINICA: { label: 'Psicología Clínica', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  EDUCACION_ESPECIAL: { label: 'Educación Especial', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  FISIOTERAPIA: { label: 'Fisioterapia', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
};

export const TherapistManagement: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'warning' | 'info') => void }> = ({ onShowToast }) => {
  const { token } = useAuth();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'PSICOLOGIA_CLINICA', password: '' });
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'PSICOLOGIA_CLINICA' });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const loadSpecialists = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/specialists`, { headers });
      const specs = res.data;

      const statsPromises = specs.map(async (s: Specialist) => {
        try {
          const statsRes = await axios.get(`${API_URL}/auth/specialists/${s.id}/stats`, { headers });
          return { ...s, assignedPatients: statsRes.data.assignedPatients, totalSessions: statsRes.data.totalSessions };
        } catch {
          return { ...s, assignedPatients: 0, totalSessions: 0 };
        }
      });

      const withStats = await Promise.all(statsPromises);
      setSpecialists(withStats);
    } catch (err) {
      console.error('Error loading specialists', err);
    }
  }, [token]);

  const loadPatients = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/patients`, { headers });
      setPatients(res.data);
    } catch (err) {
      console.error('Error loading patients', err);
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadSpecialists(), loadPatients()]);
      setLoading(false);
    };
    load();
  }, [loadSpecialists, loadPatients]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      onShowToast('Todos los campos son requeridos', 'warning');
      return;
    }
    try {
      await axios.post(`${API_URL}/auth/register`, createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'PSICOLOGIA_CLINICA' });
      await loadSpecialists();
      onShowToast('Especialista creado correctamente', 'success');
    } catch (err: any) {
      onShowToast(err.response?.data?.error || 'Error al crear', 'warning');
    }
  };

  const handleEdit = async () => {
    if (!selectedSpecialist) return;
    try {
      const payload: any = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      await axios.put(`${API_URL}/auth/specialists/${selectedSpecialist.id}`, payload, { headers });
      setShowEditModal(false);
      setSelectedSpecialist(null);
      await loadSpecialists();
      onShowToast('Especialista actualizado', 'success');
    } catch (err: any) {
      onShowToast(err.response?.data?.error || 'Error al actualizar', 'warning');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/auth/specialists/${id}`, { headers });
      setDeleteConfirm(null);
      if (selectedSpecialist?.id === id) setSelectedSpecialist(null);
      await loadSpecialists();
      onShowToast('Especialista eliminado', 'success');
    } catch (err: any) {
      onShowToast(err.response?.data?.error || 'Error al eliminar', 'warning');
    }
  };

  const handleAssign = async (patientId: string) => {
    if (!selectedSpecialist) return;
    try {
      await axios.post(`${API_URL}/patients/${patientId}/assign`, { specialistId: selectedSpecialist.id }, { headers });
      await loadPatients();
      onShowToast('Paciente asignado correctamente', 'success');
    } catch (err: any) {
      onShowToast(err.response?.data?.error || 'Error al asignar', 'warning');
    }
  };

  const handleUnassign = async (patientId: string) => {
    if (!selectedSpecialist) return;
    try {
      await axios.delete(`${API_URL}/patients/${patientId}/assign/${selectedSpecialist.id}`, { headers });
      await loadPatients();
      onShowToast('Paciente desasignado', 'success');
    } catch (err: any) {
      onShowToast(err.response?.data?.error || 'Error al desasignar', 'warning');
    }
  };

  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
  });

  const getRoleConfig = (role: string) => ROLE_CONFIG[role] || ROLE_CONFIG.PSICOLOGIA_CLINICA;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-teal-600" />
            Gestión de Terapeutas
          </h1>
          <p className="text-sm text-slate-500 mt-1">Administra especialistas, asignaciones de pacientes y permisos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Especialista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Specialists List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Especialistas ({specialists.length})
          </h2>
          {specialists.map(spec => {
            const config = getRoleConfig(spec.role);
            const Icon = config.icon;
            const isSelected = selectedSpecialist?.id === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedSpecialist(spec)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-200 shadow-lg shadow-teal-100/50'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} border flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{spec.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{spec.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {spec.assignedPatients ?? 0} pacientes
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {spec.totalSessions ?? 0} sesiones
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-teal-500' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-2">
          {selectedSpecialist ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getRoleConfig(selectedSpecialist.role);
                    const Icon = config.icon;
                    return (
                      <div className={`w-12 h-12 rounded-xl ${config.bg} border flex items-center justify-center`}>
                        <Icon size={22} className={config.color} />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedSpecialist.name}</h2>
                    <p className="text-xs text-slate-500">{selectedSpecialist.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditForm({ name: selectedSpecialist.name, email: selectedSpecialist.email, role: selectedSpecialist.role, password: '' });
                      setShowEditModal(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  {deleteConfirm === selectedSpecialist.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                      <span className="text-[10px] font-bold text-rose-600">¿Eliminar?</span>
                      <button onClick={() => handleDelete(selectedSpecialist.id)} className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-lg cursor-pointer">Sí</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-lg cursor-pointer">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(selectedSpecialist.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Assignment Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserPlus size={16} className="text-teal-600" />
                    Pacientes Asignados
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(true);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-100 transition-all cursor-pointer border border-teal-100"
                  >
                    <Plus size={14} />
                    Asignar Paciente
                  </button>
                </div>

                {patients.filter(p => p.assignments?.some(a => a.specialistId === selectedSpecialist.id)).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No tiene pacientes asignados</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patients
                      .filter(p => p.assignments?.some(a => a.specialistId === selectedSpecialist.id))
                      .map(patient => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                              {patient.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{patient.name}</p>
                              <p className="text-[10px] text-slate-400">{patient.diagnosis} · {patient.age} años</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnassign(patient.id)}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            Desasignar
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">Selecciona un especialista</h3>
              <p className="text-sm text-slate-400">Haz clic en un especialista de la izquierda para ver sus detalles y asignaciones</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Especialista</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre completo</label>
                <input type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Dr. Juan Pérez" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Correo electrónico</label>
                <input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="correo@neurorobi.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Contraseña</label>
                <input type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Rol</label>
                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                  <option value="PSICOLOGIA_CLINICA">Psicología Clínica</option>
                  <option value="EDUCACION_ESPECIAL">Educación Especial</option>
                  <option value="FISIOTERAPIA">Fisioterapia</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all cursor-pointer shadow-lg shadow-teal-600/20">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSpecialist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Editar Especialista</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Correo</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nueva contraseña (dejar vacío para no cambiar)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Opcional" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Rol</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                  <option value="PSICOLOGIA_CLINICA">Psicología Clínica</option>
                  <option value="EDUCACION_ESPECIAL">Educación Especial</option>
                  <option value="FISIOTERAPIA">Fisioterapia</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleEdit} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all cursor-pointer shadow-lg shadow-teal-600/20">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Patient Modal */}
      {showAssignModal && selectedSpecialist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Asignar Paciente a {selectedSpecialist.name}</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Buscar por nombre o diagnóstico..."
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm font-semibold">No se encontraron pacientes</p>
                </div>
              ) : (
                filteredPatients.map(patient => {
                  const isAssigned = patient.assignments?.some(a => a.specialistId === selectedSpecialist.id);
                  return (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                          {patient.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{patient.name}</p>
                          <p className="text-[10px] text-slate-400">{patient.diagnosis} · {patient.age} años · {patient._count?.sessions ?? 0} sesiones</p>
                        </div>
                      </div>
                      {isAssigned ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">Asignado</span>
                      ) : (
                        <button
                          onClick={() => handleAssign(patient.id)}
                          className="text-[10px] font-bold text-teal-600 hover:text-teal-800 px-2.5 py-1 rounded-lg hover:bg-teal-50 border border-teal-100 transition-all cursor-pointer"
                        >
                          Asignar
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
