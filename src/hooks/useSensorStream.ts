import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SensorReading, SpikesLogItem } from '../types';

interface UseSensorStreamProps {
  isStreaming: boolean;
  onSpikeTriggered?: (spike: SpikesLogItem) => void;
  patientId?: string; // Need patientId to start stream
  deviceType?: 'pulsera' | 'oso';
}

export const useSensorStream = ({ isStreaming, onSpikeTriggered, patientId, deviceType = 'pulsera' }: UseSensorStreamProps) => {
  const [streamData, setStreamData] = useState<SensorReading[]>([]);
  const [spikesLog, setSpikesLog] = useState<SpikesLogItem[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isFsrConnected, setIsFsrConnected] = useState(false);
  const [isPulseConnected, setIsPulseConnected] = useState(false);
  const [isGyroConnected, setIsGyroConnected] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [switch1Pressed, setSwitch1Pressed] = useState(false);
  const [switch2Pressed, setSwitch2Pressed] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [strongShakeCount, setStrongShakeCount] = useState(0);
  const [switch1HoldSeconds, setSwitch1HoldSeconds] = useState(0);
  const [switch2HoldSeconds, setSwitch2HoldSeconds] = useState(0);
  const switch1HoldSecondsRef = useRef(0);
  const switch2HoldSecondsRef = useRef(0);
  const strongShakeActiveRef = useRef(false);

  // Live aggregates
  const [maxGripForce, setMaxGripForce] = useState(0);
  const [bilateralTouchSync, setBilateralTouchSync] = useState(70);
  const [stereotypicalTicks, setStereotypicalTicks] = useState(0);
  const [avgHeartRate, setAvgHeartRate] = useState(85);
  const [avgHugForce, setAvgHugForce] = useState(35);

  const [socket, setSocket] = useState<Socket | null>(null);

  // Keep a mutable ref of the callback to avoid rebuilding effect on every render
  const onSpikeTriggeredRef = useRef(onSpikeTriggered);
  useEffect(() => {
    onSpikeTriggeredRef.current = onSpikeTriggered;
  }, [onSpikeTriggered]);

  const resetStream = useCallback(() => {
    setStreamData([]);
    setSpikesLog([]);
    setSecondsElapsed(0);
    setMaxGripForce(0);
    setBilateralTouchSync(75);
    setStereotypicalTicks(0);
    setAvgHeartRate(82);
    setAvgHugForce(32);
    setIsDeviceConnected(false);
    setIsFsrConnected(false);
    setIsPulseConnected(false);
    setIsGyroConnected(false);
    setStrongShakeCount(0);
    strongShakeActiveRef.current = false;
  }, []);

  const smoothValue = useCallback((newValue: number, previousValue: number, alpha = 0.25) => {
    return Math.round(previousValue + (newValue - previousValue) * alpha);
  }, []);

  const triggerSpike = useCallback((_type: 'Presión' | 'Frecuencia Cardíaca' | 'Cinemática', _customValue?: number) => {
    // Left empty for manual triggers if needed
  }, []);

  useEffect(() => {
    if (isStreaming && patientId) {
      resetStream();

      const newSocket = io(import.meta.env.VITE_WS_URL || 'wss://neurorobibackendproduccion-production.up.railway.app', {
        transports: ['websocket']
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setSocketConnected(true);
        newSocket.emit('start-stream', { patientId, deviceType });
      });

      newSocket.on('disconnect', () => {
        setSocketConnected(false);
        setIsDeviceConnected(false);
      });

      newSocket.on('connect_error', () => {
        setSocketConnected(false);
      });

      let localSeconds = 0;

      newSocket.on('sensor-data', (data: SensorReading) => {
        if (data.deviceType !== deviceType) return;

        localSeconds += 1;
        setSecondsElapsed(localSeconds);

        if (data.switch1) {
          switch1HoldSecondsRef.current += 1;
        } else {
          switch1HoldSecondsRef.current = 0;
        }

        if (data.switch2) {
          switch2HoldSecondsRef.current += 1;
        } else {
          switch2HoldSecondsRef.current = 0;
        }

        setSwitch1HoldSeconds(switch1HoldSecondsRef.current);
        setSwitch2HoldSeconds(switch2HoldSecondsRef.current);

        const rawShake = Number(data.shakeIntensity ?? 0);
        const rotationMag = Math.round(
          Math.sqrt(
            data.rotationX * data.rotationX +
            data.rotationY * data.rotationY +
            data.rotationZ * data.rotationZ
          ) / 6
        );
        const shakes = Math.max(rawShake, rotationMag);

        setStreamData(prev => {
          const lastReading = prev[prev.length - 1];
          const smoothedReading = {
            ...data,
            hugForce: lastReading ? smoothValue(data.hugForce, lastReading.hugForce, 0.2) : data.hugForce,
            heartRate: lastReading ? smoothValue(data.heartRate, lastReading.heartRate, 0.18) : data.heartRate,
            temperatureC: lastReading ? smoothValue(data.temperatureC, lastReading.temperatureC ?? 0, 0.2) : data.temperatureC,
            rotationX: lastReading ? smoothValue(data.rotationX, lastReading.rotationX, 0.22) : data.rotationX,
            rotationY: lastReading ? smoothValue(data.rotationY, lastReading.rotationY, 0.22) : data.rotationY,
            rotationZ: lastReading ? smoothValue(data.rotationZ, lastReading.rotationZ, 0.22) : data.rotationZ,
            shakeIntensity: lastReading ? smoothValue(shakes, lastReading.shakeIntensity ?? 0, 0.25) : shakes,
            switch1Duration: switch1HoldSecondsRef.current,
            switch2Duration: switch2HoldSecondsRef.current
          };

          const updated = [...prev, smoothedReading];
          if (updated.length > 25) updated.shift();
          return updated;
        });

        setSwitch1Pressed(Boolean(data.switch1));
        setSwitch2Pressed(Boolean(data.switch2));
        setShakeIntensity(shakes);

        const isStrongShake = shakes >= 18;
        if (isStrongShake && !strongShakeActiveRef.current) {
          strongShakeActiveRef.current = true;
          setStrongShakeCount(prev => prev + 1);
        } else if (!isStrongShake) {
          strongShakeActiveRef.current = false;
        }

        const connectedByForce = typeof data.hugForce === 'number' && data.hugForce >= 0;
        if (connectedByForce || data.switch1 || data.switch2) {
          setIsFsrConnected(true);
          setMaxGripForce(prev => Math.max(prev, data.hugForce >= 0 ? data.hugForce : prev));
          setAvgHugForce(prev => {
            const current = data.hugForce >= 0 ? data.hugForce : (data.switch1 || data.switch2 ? 50 : 0);
            return Math.round((prev * 0.9) + (current * 0.1));
          });
        } else {
          setIsFsrConnected(false);
        }

        if (data.heartRate !== -1) {
          setIsPulseConnected(true);
          setAvgHeartRate(prev => Math.round((prev * 0.9) + (data.heartRate * 0.1)));
        } else {
          setIsPulseConnected(false);
        }

        if (data.rotationX !== -999 || shakes > 0) {
          setIsGyroConnected(true);
        } else {
          setIsGyroConnected(false);
        }

        setBilateralTouchSync(prev => {
          const delta = -3 + Math.floor(Math.random() * 7);
          return Math.max(50, Math.min(100, prev + delta));
        });
        
        // Mark device connected upon receiving data packet
        setIsDeviceConnected(true);
      });

      newSocket.on('device-status', ({ deviceType: statusDeviceType, connected }: { deviceType: 'pulsera' | 'oso'; connected: boolean }) => {
        if (statusDeviceType !== deviceType) return;
        setIsDeviceConnected(connected);
        if (!connected) {
          setIsFsrConnected(false);
          setIsPulseConnected(false);
          setIsGyroConnected(false);
        }
      });

      newSocket.on('spike-triggered', (spike: SpikesLogItem) => {
        if (spike.deviceType !== deviceType) return;
        setSpikesLog(prev => [spike, ...prev]);
        if (spike.type === 'Cinemática') {
          setStereotypicalTicks(prev => prev + 1);
        }
        if (onSpikeTriggeredRef.current) {
          onSpikeTriggeredRef.current(spike);
        }
      });

      return () => {
        newSocket.emit('stop-stream');
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.emit('stop-stream');
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isStreaming, patientId, resetStream, deviceType]);

  return {
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
    switch1Pressed,
    switch2Pressed,
    switch1HoldSeconds,
    switch2HoldSeconds,
    shakeIntensity,
    strongShakeCount,
    resetStream,
    triggerSpike
  };
};
