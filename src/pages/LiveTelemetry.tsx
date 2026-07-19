import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { useRole } from '../context/RoleContext';
import { useSensorStream } from '../hooks/useSensorStream';
// Dashboard views rendered directly in telemetry panels

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Wifi, 
  Activity, 
  Zap, 
  Heart, 
  Timer,
  Square,
  AlertTriangle
} from 'lucide-react';


interface LiveTelemetryProps {
  onEndSessionSuccess: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const LiveTelemetry: React.FC<LiveTelemetryProps> = ({
  onEndSessionSuccess,
  onShowSuccessToast
}) => {
  const { activePatient, activeSession, endSession, startSession, patients } = usePatients();
  const { activeRole } = useRole();


  // Active streaming state
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedDeviceType, setSelectedDeviceType] = useState<'pulsera' | 'oso'>('oso');
  const [triggers] = useState<string[]>([]);
  const [fatigueCheckmarks] = useState<Record<string, boolean>>({
    forceLoss: false,
    tremors: false,
    slowCoordination: false,
    digitRigidity: false
  });


  // Callback whenever a spike is triggered by the hook (random or manual)
  const handleSpikeTriggered = (spike: any) => {
    onShowSuccessToast(`⚠️ ${spike.type} Spike: ${spike.alertText}`);
  };

  // Instantiate the continuous sensor hook
  const {
    streamData,
    spikesLog,
    secondsElapsed,
    maxGripForce,
    bilateralTouchSync,
    stereotypicalTicks,
    avgHeartRate,
    avgHugForce,
    isDeviceConnected,
    isFsrConnected,
    isPulseConnected,
    isGyroConnected,
    socketConnected,
    shakeIntensity,
    strongShakeCount,
    triggerSpike
  } = useSensorStream({
    isStreaming,
    onSpikeTriggered: handleSpikeTriggered,
    patientId: activePatient?.id,
    deviceType: selectedDeviceType
  });

  if (!activePatient) {
    const handleStartDemo = () => {
      const demoPatient = patients[0] || { id: 'pat-101' };
      startSession(demoPatient.id);
      onShowSuccessToast(`✓ Sesión terapéutica demo iniciada.`);
    };

    return (
      <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95 duration-300">
        <Activity className="text-teal-600 mx-auto mb-4 animate-pulse" size={48} />
        <h2 className="text-base font-bold text-slate-700">Sin Paciente Activo</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1 mb-6">
          Se requiere iniciar una sesión terapéutica con un paciente en el Directorio para transmitir telemetría desde el juguete.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleStartDemo}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-600/20 active:scale-98 cursor-pointer"
          >
            Iniciar Sesión Demo
          </button>
        </div>
      </div>
    );
  }

  // Calculate current/latest values
  const latestReading = streamData[streamData.length - 1] || {
    deviceType: selectedDeviceType,
    hugForce: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    heartRate: 80,
    switch1: false,
    switch2: false,
    shakeIntensity: 0
  };

  const currentHugForce = latestReading.hugForce >= 0
    ? latestReading.hugForce
    : latestReading.switch1 || latestReading.switch2
      ? 55
      : 0;

  const forceIsActive = currentHugForce > 0 || latestReading.switch1 || latestReading.switch2;
  const currentShakeIntensity = latestReading.shakeIntensity ?? shakeIntensity;

  // Calculate rotation magnitude
  const rotationMagnitude = Math.round(
    Math.sqrt(
      latestReading.rotationX * latestReading.rotationX +
      latestReading.rotationY * latestReading.rotationY +
      latestReading.rotationZ * latestReading.rotationZ
    )
  );

  // Formatter for timer display
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Triggered when completing the therapy session
  const handleEndSession = () => {
    if (!isDeviceConnected) {
      onShowSuccessToast(`❌ No se puede finalizar sesión: El ESP32 está desconectado.`);
      return;
    }

    if (!activeSession) {
      onShowSuccessToast(`❌ No hay sesión activa para finalizar.`);
      return;
    }
    
    setIsStreaming(false);

    // Compute closing calculated metrics
    const activeCount = Object.values(fatigueCheckmarks).filter(Boolean).length;
    const computedFatigueScore = activeCount * 25;
    
    const comfortIndex = Math.min(100, Math.round(avgHugForce * 1.35));
    const calmStatePercentage = Math.max(20, 100 - (stereotypicalTicks * 12));

    const finalMetrics = {
      avgHeartRate,
      maxHeartRate: Math.round(avgHeartRate * 1.25),
      minHeartRate: Math.round(avgHeartRate * 0.85),
      avgHugForce,
      maxHugForce: maxGripForce,
      comfortIndex,
      bilateralSync: bilateralTouchSync,
      motorFatigueScore: computedFatigueScore,
      stereotypicalCount: stereotypicalTicks,
      calmStatePercentage,
      spikesCount: spikesLog.length
    };

    const activeRobotLabel = selectedDeviceType === 'pulsera' ? 'Pulsera' : 'Oso';
    const notesSummary = `Session summary for ${activePatient?.name || 'child'}. Specialist Role: ${activeRole}. Device: ${activeRobotLabel}. Recorded ${stereotypicalTicks} motor movements. Max pressure was ${maxGripForce}%. Recorded triggers: ${triggers.join(', ') || 'None'}. Mode: REAL.`;

    endSession(
      notesSummary,
      secondsElapsed,
      finalMetrics,
      streamData,
      spikesLog,
      selectedDeviceType
    );

    onShowSuccessToast(`✓ Sesión finalizada con éxito. Procesando reporte clínico...`);
    onEndSessionSuccess();
  };

// Fatigue checkmarks and trigger logs cleared as direct sensor view is now active

  return (
    <div className="space-y-6">
      
      {/* Top Section: Active Patient Info & Flashing Device Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs">
        
        {/* Patient Capsule */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
            {activePatient?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-800">{activePatient?.name}</h2>
              <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded-full">{activePatient?.age} años</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Diagnóstico: <span className="text-teal-600">{activePatient?.diagnosis}</span></p>
          </div>
        </div>

        {/* Device Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedDeviceType('pulsera')}
            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition ${selectedDeviceType === 'pulsera' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Pulsera
          </button>
          <button
            type="button"
            onClick={() => setSelectedDeviceType('oso')}
            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition ${selectedDeviceType === 'oso' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Oso
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700 text-[10px] font-black uppercase tracking-wider">
          <span>Transmisión desde:</span>
          <span className="px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
            {selectedDeviceType === 'pulsera' ? 'Pulsera' : 'Oso'}
          </span>
        </div>

        {/* Telemetry Status Controller */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
          
          {/* Connection Status Flag */}
          {isDeviceConnected ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl">
              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-emerald-800 font-black tracking-wider text-[10px] uppercase">CONECTADO</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3.5 py-2 rounded-xl">
              <span className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-rose-800 font-black tracking-wider text-[10px] uppercase">DESCONECTADO</span>
            </div>
          )}

          {/* Wi-Fi Wave Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
            isDeviceConnected ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <Wifi size={14} className={isDeviceConnected ? 'animate-pulse' : ''} />
            <span>{isDeviceConnected ? 'Señal Activa' : 'Sin Señal'}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
            socketConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
            <span>{socketConnected ? 'Socket Conectado' : 'Socket Desconectado'}</span>
          </div>

          {/* Live Timer Counter */}
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3.5 py-2 rounded-xl text-teal-700">
            <Timer size={14} />
            <span className="font-mono text-sm leading-none">{formatTime(secondsElapsed)}</span>
          </div>

        </div>

      </div>


      {!isDeviceConnected ? (
        <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-md max-w-2xl mx-auto text-center space-y-6 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-100">
            <Wifi size={40} className="animate-pulse" />
            <span className="absolute bottom-0 right-0 h-4 w-4 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">⚠️ Dispositivo Neurorobi Desconectado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              La interfaz está en modo <strong>ESP32 Real</strong> pero el servidor no está recibiendo datos. Enciende el juguete y verifica la conexión para continuar la terapia.
            </p>
          </div>

          <div className="border border-slate-100 bg-slate-50 rounded-2xl p-5 text-left text-xs space-y-4 max-w-lg mx-auto">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              📋 Guía de Conexión del Hardware:
            </h4>
            
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>El ESP32 y esta computadora deben estar en la <strong>misma red Wi-Fi</strong>.</li>
              <li>Configura tu sketch de ESP32 para hacer peticiones <strong>HTTP POST</strong> a:
                <div className="mt-1 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-teal-600 font-bold select-all overflow-x-auto text-[11px]">
                  http://&lt;IP_DE_TU_PC&gt;:3001/api/telemetry
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  💡 (Ej: Abre una terminal en tu PC y escribe <code className="bg-slate-200 px-1 rounded">ipconfig</code> para buscar tu dirección IPv4 local, ej: <code className="bg-slate-200 px-1 rounded">192.168.100.15</code>).
                </span>
              </li>
              <li>El ESP32 debe transmitir un JSON cada 1 segundo con la siguiente estructura:
                <pre className="mt-1 bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-lg overflow-x-auto">
{`{
  "hugForce": 45,      // Presión (0 a 100)
  "rotationX": 15,     // Giroscopio X
  "rotationY": -5,     // Giroscopio Y
  "rotationZ": 8,      // Giroscopio Z
  "heartRate": 85      // Pulso (bpm)
}`}
                </pre>
              </li>
            </ol>
          </div>

          <div className="flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Escuchando en puerto 3001...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Grid: Recharts Fluid AreaChart continuous stream */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="text-teal-600 animate-pulse" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Flujo de Sensores en Tiempo Real (ESP32 Real)
                </h3>
              </div>
              
              {/* Quick indicators */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500"></span> Presión (Hug): {currentHugForce}%</span>
                {selectedDeviceType === 'oso' ? (
                  <>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Brazo Izquierdo: {latestReading.switch1 ? 'ACTIVO' : 'INACTIVO'}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-fuchsia-500"></span> Brazo Derecho: {latestReading.switch2 ? 'ACTIVO' : 'INACTIVO'}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Sacudón: {currentShakeIntensity} pts</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Pulso (HR): {latestReading.heartRate} bpm</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Cinemática: {rotationMagnitude}°/s</span>
                  </>
                )}
              </div>
            </div>

            {/* Recharts panel split into separate telemetry charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  ⏱️ Duración de Presionado de Brazos
                </span>
                {selectedDeviceType === 'oso' ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
                    <div className="h-72 bg-white rounded-2xl p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Brazo Izquierdo</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorLeftArm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 'dataMax + 1']} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            name="Izquierdo"
                            dataKey="switch1Duration"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorLeftArm)"
                            activeDot={{ r: 5 }}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-72 bg-white rounded-2xl p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Brazo Derecho</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRightArm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c026d3" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#c026d3" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 'dataMax + 1']} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            name="Derecho"
                            dataKey="switch2Duration"
                            stroke="#c026d3"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRightArm)"
                            activeDot={{ r: 5 }}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLeftArm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 'dataMax + 1']} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Area
                          type="monotone"
                          name="Pulso Cardíaco (bpm)"
                          dataKey="heartRate"
                          stroke="#e11d48"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorLeftArm)"
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  🔄 Intensidad de Sacudón / Cinemática
                </span>
                <div className="h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorShake" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMotion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 150]} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                      {selectedDeviceType === 'oso' ? (
                        <Area
                          type="monotone"
                          name="Sacudón"
                          dataKey="shakeIntensity"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorShake)"
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      ) : (
                        <Area
                          type="monotone"
                          name="Magnitud de Rotación"
                          dataKey="rotationMagnitude"
                          stroke="#ec4899"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorMotion)"
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Device-specific dashboard panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {
              selectedDeviceType === 'oso' ? (
                <>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      🤗 1. Presión / Abrazos del Peluche
                    </span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Fuerza del Abrazo</span>
                        <span className={`text-teal-600 font-bold text-[10px] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full ${forceIsActive ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {forceIsActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>

                      <div className="text-center py-4">
                        <span className="text-5xl font-black text-slate-800">{currentHugForce}%</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Intensidad de Apretón</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs font-medium text-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">Brazo Izquierdo</span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${latestReading.switch1 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                              {latestReading.switch1 ? 'PRESIONADO' : 'LIBRE'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Estado de toque lateral izquierdo.</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs font-medium text-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">Brazo Derecho</span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${latestReading.switch2 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                              {latestReading.switch2 ? 'PRESIONADO' : 'LIBRE'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Estado de toque lateral derecho.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
                        <div className="flex justify-between mb-2">
                          <span>Abrazo Promedio:</span>
                          <span className="font-bold text-slate-700">{avgHugForce}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Calidad de Contacto:</span>
                          <span className="font-bold text-teal-600">{currentHugForce > 60 ? 'Fuerte' : currentHugForce > 20 ? 'Moderado' : 'Suave'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      🖐️ 2. Switches Izquierdo/Derecho
                    </span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">Brazo Izquierdo (SW1)</span>
                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${latestReading.switch1 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {latestReading.switch1 ? 'PRESIONADO' : 'LIBRE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">Brazo Derecho (SW2)</span>
                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${latestReading.switch2 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {latestReading.switch2 ? 'PRESIONADO' : 'LIBRE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      🌪️ 3. Sacudón / Agitación
                    </span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Intensidad de Sacudón</span>
                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${currentShakeIntensity > 80 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                          {currentShakeIntensity > 0 ? `${currentShakeIntensity} pts` : 'SIN SACUDIDA'}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
                        <div className="flex justify-between">
                          <span>Último evento:</span>
                          <span className="font-bold text-slate-800">{currentShakeIntensity > 0 ? 'Detectado' : 'No detectado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alerta de movimiento:</span>
                          <span className={`font-bold ${currentShakeIntensity > 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {currentShakeIntensity > 80 ? 'Alta' : 'Estable'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-between pt-3 border-t border-slate-100 gap-2">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Sacudones fuertes</span>
                          <span className="text-4xl font-black text-slate-900 leading-none">{strongShakeCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Sensor de Presión / Fuerza (FSR) card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      🎛️ 1. Sensor FSR (Fuerza y Abrazo)
                    </span>
                    {isFsrConnected ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Lectura FSR Directa</span>
                          <span className="text-rose-500 font-bold text-[10px] bg-rose-50 border border-rose-100/60 px-2.5 py-0.5 rounded-full">
                            ACTIVO
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-around py-2">
                          <div className="text-center">
                            <span className="text-3xl font-black text-slate-800">{latestReading.hugForce}%</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Fuerza Actual</p>
                          </div>
                          <div className="h-8 w-px bg-slate-100"></div>
                          <div className="text-center">
                            <span className="text-3xl font-black text-teal-600">{maxGripForce}%</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Fuerza Máxima</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
                          <div className="flex justify-between mb-1">
                            <span>Abrazo Promedio:</span>
                            <span className="font-bold text-slate-700">{avgHugForce}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Calidad de Agarre:</span>
                            <span className="font-bold text-teal-600">{latestReading.hugForce > 60 ? 'Alto' : latestReading.hugForce > 20 ? 'Medio' : 'Leve'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-xs text-center text-rose-700 font-bold text-xs flex flex-col justify-center items-center gap-2 min-h-[220px]">
                        <Heart size={28} className="text-rose-400 animate-pulse" />
                        <span>Sensor FSR Desconectado</span>
                        <p className="text-[10px] text-slate-400 font-normal max-w-[160px]">
                          El canal analógico 34 no reporta datos del sensor de fuerza.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2. Sensor de Ritmo Cardíaco (Pulso) card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      💓 2. Sensor de Pulso (Ritmo Cardíaco)
                    </span>
                    {isPulseConnected ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Pulso Cardíaco</span>
                          <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                            ACTIVO
                          </span>
                        </div>

                        <div className="flex items-center justify-around py-2">
                          <div className="text-center">
                            <span className="text-3xl font-black text-slate-800">{latestReading.heartRate} <span className="text-xs text-slate-400 font-bold">bpm</span></span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Ritmo Actual</p>
                          </div>
                          <div className="h-8 w-px bg-slate-100"></div>
                          <div className="text-center">
                            <span className="text-3xl font-black text-emerald-600">{avgHeartRate} <span className="text-xs text-slate-400 font-bold">bpm</span></span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Ritmo Promedio</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
                          <div className="flex justify-between">
                            <span>Tono de Regulación:</span>
                            <span className={`font-bold ${latestReading.heartRate > 115 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {latestReading.heartRate > 115 ? 'Taquicardia' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-xs text-center text-rose-700 font-bold text-xs flex flex-col justify-center items-center gap-2 min-h-[220px]">
                        <Activity size={28} className="text-rose-400 animate-pulse" />
                        <span>Sensor de Pulso Desconectado</span>
                        <p className="text-[10px] text-slate-400 font-normal max-w-[160px]">
                          El canal analógico 35 no reporta señal del ritmo cardíaco.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Sensor de Movimiento (Giroscopio MPU6050) card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      📐 3. Giroscopio (Movimiento 3D)
                    </span>
                    {isGyroConnected ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Cinemática MPU6050</span>
                          <span className="text-indigo-600 font-bold text-[10px] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                            ACTIVO
                          </span>
                        </div>

                        <div className="flex items-center justify-around py-2">
                          <div className="text-center">
                            <span className="text-3xl font-black text-slate-800">{rotationMagnitude} <span className="text-xs text-slate-400 font-bold">°/s</span></span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Magnitud Actual</p>
                          </div>
                          <div className="h-8 w-px bg-slate-100"></div>
                          <div className="text-center">
                            <span className="text-3xl font-black text-indigo-600">{stereotypicalTicks}</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Tics Motores</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 text-[10px] text-slate-500 font-medium space-y-1">
                          <div className="flex justify-between">
                            <span>Coordenadas Ejes:</span>
                            <span className="font-mono font-bold text-slate-700">
                              X: {latestReading.rotationX}°/s | Y: {latestReading.rotationY}°/s | Z: {latestReading.rotationZ}°/s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estado de Movimiento:</span>
                            <span className={`font-bold ${rotationMagnitude > 130 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {rotationMagnitude > 130 ? 'Agitación / Crisis' : 'Estable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-xs text-center text-rose-700 font-bold text-xs flex flex-col justify-center items-center gap-2 min-h-[220px]">
                        <Wifi size={28} className="text-rose-400 animate-pulse" />
                        <span>MPU6050 Desconectado</span>
                        <p className="text-[10px] text-slate-400 font-normal max-w-[160px]">
                          No se detectó comunicación I2C con el giroscopio.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )
            }
          </div>

          {/* Interactive Spike Injector & Action Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Clinician manual spike injectors (Demo helpers) */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Zap size={12} className="text-amber-500" />
                  Inyectores Manuales de Telemetría (Herramienta de Demostración)
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-4 font-medium">
                  Simule anomalías fisiológicas o físicas del juguete en tiempo real para evaluar las alertas del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => triggerSpike('Presión')}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all"
                >
                  <Heart size={14} fill="currentColor" /> Inyectar Presión (Abrazo)
                </button>
                
                <button
                  onClick={() => triggerSpike('Frecuencia Cardíaca')}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all animate-live-pulse"
                >
                  <AlertTriangle size={14} /> Inyectar Taquicardia
                </button>

                <button
                  onClick={() => triggerSpike('Cinemática')}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                >
                  <Zap size={14} /> Inyectar Crisis Motora
                </button>
              </div>
            </div>

            {/* Master Stop Button */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Control Maestro de Sesión</span>
              
              <button
                onClick={handleEndSession}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-98 transition-all animate-pulse"
              >
                <Square size={14} fill="currentColor" />
                Finalizar Sesión Terapéutica
              </button>
              
              <span className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider text-center">
                Congela el flujo y procesa promedios
              </span>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
