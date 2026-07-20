import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { Patient, ClinicalSession, ClinicalDiagnosis } from '../types';
import { useAuth } from './AuthContext';

interface PatientContextType {
  patients: Patient[];
  activePatient: Patient | null;
  sessions: ClinicalSession[];
  activeSession: ClinicalSession | null;
  registerPatient: (name: string, age: number, diagnosis: ClinicalDiagnosis, initialObservation: string, profileImage: File | null, specialistId?: string) => Promise<Patient | undefined>;
  updatePatient: (id: string, name: string, age: number, diagnosis: ClinicalDiagnosis, initialObservation: string, profileImage: File | null) => Promise<Patient | undefined>;
  deletePatient: (id: string) => Promise<boolean>;
  startSession: (patientId: string) => void;
  endSession: (notes: string, durationSeconds: number, metrics: any, sensorHistory: any[], spikesLog: any[], deviceType?: 'pulsera' | 'oso') => void;
  archiveSession: (session: ClinicalSession) => Promise<void>;
  clearActiveSession: () => void;
  selectPatient: (patient: Patient | null) => void;
  loadDemoSession: () => void;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 200;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      resolve(canvas.toDataURL('image/webp', 0.6));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const API_URL = `${import.meta.env.VITE_API_URL || 'https://neurorobibackendproduccion-production.up.railway.app'}/api`;

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getToken } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<ClinicalSession[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeSession, setActiveSession] = useState<ClinicalSession | null>(null);

  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Initialize from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsRes = await axios.get(`${API_URL}/patients`, { headers: getAuthHeaders() });
        setPatients(patientsRes.data);
        
        const sessionsRes = await axios.get(`${API_URL}/sessions`, { headers: getAuthHeaders() });
        setSessions(sessionsRes.data);
      } catch (err) {
        console.error("Failed to load initial data from backend", err);
      }
    };
    fetchData();
  }, []);

  // Register New Patient
  const registerPatient = async (
    name: string,
    age: number,
    diagnosis: ClinicalDiagnosis,
    initialObservation: string,
    profileImage: File | null,
    specialistId?: string
  ): Promise<Patient | undefined> => {
    try {
      let profileImageBase64: string | null = null;
      if (profileImage) {
        profileImageBase64 = await compressImage(profileImage);
      }

      const res = await axios.post(`${API_URL}/patients`, {
        name,
        age,
        diagnosis,
        initialObservation,
        profileImageBase64,
        specialistId: specialistId || undefined
      }, { headers: getAuthHeaders() });
      const newPatient = res.data;
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err) {
      console.error("Failed to register patient", err);
    }
  };

  // Update Existing Patient
  const updatePatient = async (
    id: string,
    name: string,
    age: number,
    diagnosis: ClinicalDiagnosis,
    initialObservation: string,
    profileImage: File | null
  ): Promise<Patient | undefined> => {
    try {
      let profileImageBase64: string | null = null;
      if (profileImage) {
        profileImageBase64 = await compressImage(profileImage);
      }

      const res = await axios.put(`${API_URL}/patients/${id}`, {
        name,
        age,
        diagnosis,
        initialObservation,
        profileImageBase64
      }, { headers: getAuthHeaders() });
      const updated = res.data;
      setPatients(prev => prev.map(p => p.id === id ? updated : p));
      if (activePatient?.id === id) {
        setActivePatient(updated);
      }
      return updated;
    } catch (err) {
      console.error("Failed to update patient", err);
    }
  };

  // Delete Patient
  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/patients/${id}`, { headers: getAuthHeaders() });
      setPatients(prev => prev.filter(p => p.id !== id));
      setSessions(prev => prev.filter(s => s.patientId !== id));
      if (activePatient?.id === id) {
        setActivePatient(null);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete patient", err);
      return false;
    }
  };

  // Start Therapy Session
  const startSession = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Set active patient
    setActivePatient(patient);

    try {
      await axios.put(`${API_URL}/patients/${patientId}/status`, { status: 'En Sesión' }, { headers: getAuthHeaders() });
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'En Sesión' } : p));
    } catch (e) {
      console.error("Failed to update status", e);
    }

    // Create draft active session
    const draftSession: ClinicalSession = {
      id: `sess-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toLocaleDateString(),
      durationSeconds: 0,
      specialistRole: 'PSICOLOGIA_CLINICA', // Initial default role
      notes: '',
      deviceType: 'pulsera',
      metrics: {
        avgHeartRate: 0,
        maxHeartRate: 0,
        minHeartRate: 0,
        avgHugForce: 0,
        maxHugForce: 0,
        comfortIndex: 0,
        bilateralSync: 0,
        motorFatigueScore: 0,
        stereotypicalCount: 0,
        calmStatePercentage: 100,
        spikesCount: 0
      },
      sensorHistory: [],
      spikesLog: []
    };

    setActiveSession(draftSession);
  };

  // End Session (freezes stream and holds calculations in temporary active state)
  const endSession = (
    notes: string,
    durationSeconds: number,
    metrics: any,
    sensorHistory: any[],
    spikesLog: any[],
    deviceType?: 'pulsera' | 'oso'
  ) => {
    if (!activeSession) return;

    const finalizedSession: ClinicalSession = {
      ...activeSession,
      notes,
      durationSeconds,
      metrics,
      sensorHistory,
      spikesLog,
      deviceType: deviceType ?? (activeSession.deviceType || 'pulsera')
    };

    setActiveSession(finalizedSession);
  };

  // Archive session in shared clinical history
  const archiveSession = async (session: ClinicalSession) => {
    try {
      const payload = {
        ...session,
        specialistId: user?.id
      };
      const res = await axios.post(`${API_URL}/sessions`, payload, { headers: getAuthHeaders() });
      
      setSessions(prev => [res.data, ...prev]);

      if (activePatient) {
        await axios.put(`${API_URL}/patients/${activePatient.id}/status`, { status: 'Sesión Completada' }, { headers: getAuthHeaders() });
        setPatients(prev => prev.map(p => 
          p.id === activePatient.id ? { ...p, status: 'Sesión Completada' } : p
        ));
      }

    } catch (e) {
      console.error("Failed to archive session", e);
      throw e;
    }

    // Reset session states
    setActiveSession(null);
    setActivePatient(null);
  };

  const clearActiveSession = async () => {
    if (activePatient) {
      try {
        await axios.put(`${API_URL}/patients/${activePatient.id}/status`, { status: 'Listo para Consulta' }, { headers: getAuthHeaders() });
        setPatients(prev => prev.map(p => 
          p.id === activePatient.id ? { ...p, status: 'Listo para Consulta' } : p
        ));
      } catch (e) {
        console.error("Failed to clear session status", e);
      }
    }
    setActiveSession(null);
    setActivePatient(null);
  };

  const selectPatient = (patient: Patient | null) => {
    setActivePatient(patient);
  };

  const loadDemoSession = () => {
    const patient = patients[0];
    if (!patient) return;
    setActivePatient(patient);
    
    const draftSession: ClinicalSession = {
      id: `sess-demo-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toLocaleDateString(),
      durationSeconds: 120,
      specialistRole: 'PSICOLOGIA_CLINICA',
      notes: 'Sesión de demostración cargada automáticamente para auditoría clínica.',
      deviceType: 'pulsera',
      metrics: {
        avgHeartRate: 92,
        maxHeartRate: 124,
        minHeartRate: 78,
        avgHugForce: 54,
        maxHugForce: 88,
        comfortIndex: 82,
        bilateralSync: 78,
        motorFatigueScore: 2,
        stereotypicalCount: 3,
        calmStatePercentage: 85,
        spikesCount: 2
      },
      sensorHistory: [],
      spikesLog: []
    };
    setActiveSession(draftSession);
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        activePatient,
        sessions,
        activeSession,
        registerPatient,
        updatePatient,
        deletePatient,
        startSession,
        endSession,
        archiveSession,
        clearActiveSession,
        selectPatient,
        loadDemoSession
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
