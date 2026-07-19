// Absolute TypeScript safety interfaces for Neurorobi IoT clinical platform

export type SpecialistRole = string;

export type ClinicalDiagnosis = string;

export type PatientStatus = 
  | 'Listo para Consulta' 
  | 'En Sesión' 
  | 'Sesión Completada';

export interface Specialty {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: ClinicalDiagnosis;
  status: PatientStatus;
  initialObservation: string;
  profileImageUrl?: string | null;
  registeredAt: string;
}

export interface SensorReading {
  timestamp: string; // HH:MM:SS
  deviceType: 'pulsera' | 'oso';
  hugForce: number; // 0 to 100
  rotationX: number; // -180 to 180
  rotationY: number; // -180 to 180
  rotationZ: number; // -180 to 180
  heartRate: number; // 60 to 150 bpm
  switch1?: boolean;
  switch2?: boolean;
  switch1Duration?: number;
  switch2Duration?: number;
  shakeIntensity?: number;
}

export interface SpikesLogItem {
  deviceType: 'pulsera' | 'oso';
  id: string;
  timestamp: string; // HH:MM:SS
  type: 'Presión' | 'Frecuencia Cardíaca' | 'Cinemática';
  value: number;
  alertText: string;
  severity: 'warning' | 'critical';
}

export interface SessionMetrics {
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  avgHugForce: number;
  maxHugForce: number;
  comfortIndex: number; // Calculated % (Psicólogo)
  bilateralSync: number; // Calculated % (Terapeuta Ocupacional)
  motorFatigueScore: number; // (Terapeuta Ocupacional checkmarks)
  stereotypicalCount: number; // Counts of rapid rotations (Neurólogo)
  calmStatePercentage: number; // % of time with stable gyroscope (Neurólogo)
  spikesCount: number;
}

export interface ClinicalSession {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  durationSeconds: number;
  specialistRole: SpecialistRole;
  notes: string;
  deviceType: 'pulsera' | 'oso';
  metrics: SessionMetrics;
  sensorHistory: SensorReading[];
  spikesLog: SpikesLogItem[];
}
