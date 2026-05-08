import type { MotorData } from "@/types/motor";

export const MOTOR_POLES = 4;
const VIBRATION_RATIO_POWER = 1.25;

export function syncRpmFromHz(hz: number): number {
  return (120 / MOTOR_POLES) * Math.max(hz || 0, 0);
}

export function getRpmRatio(params: {
  effectiveRpm: number;
  motorOn: boolean;
  baseHz: number;
}): number {
  if (!params.motorOn) return 0;
  const refHz = params.baseHz > 0.1 ? params.baseHz : 50;
  const refRpm = Math.max(syncRpmFromHz(refHz), 30);
  return Math.min(Math.max(params.effectiveRpm / refRpm, 0), 1.85);
}

export function scaleMotorData(
  raw: MotorData,
  ratio: number,
  motorOn: boolean,
  latestVibration: number
): { motorData: MotorData; displayVibration: number } {
  if (!motorOn) {
    return {
      motorData: {
        current: {
          phaseA: raw.current.phaseA * 0.02,
          phaseB: raw.current.phaseB * 0.02,
          phaseC: raw.current.phaseC * 0.02,
        },
        voltage: {
          phaseA: raw.voltage.phaseA * 0.15,
          phaseB: raw.voltage.phaseB * 0.15,
          phaseC: raw.voltage.phaseC * 0.15,
        },
        frequency: 0,
        temperature: {
          t1: 25 + Math.max(0, raw.temperature.t1 - 25) * 0.12,
          t2: 25 + Math.max(0, raw.temperature.t2 - 25) * 0.12,
        },
      },
      displayVibration: latestVibration * 0.05,
    };
  }

  return {
    motorData: {
      current: {
        phaseA: raw.current.phaseA * ratio,
        phaseB: raw.current.phaseB * ratio,
        phaseC: raw.current.phaseC * ratio,
      },
      voltage: {
        phaseA: raw.voltage.phaseA * ratio,
        phaseB: raw.voltage.phaseB * ratio,
        phaseC: raw.voltage.phaseC * ratio,
      },
      frequency: raw.frequency * ratio,
      temperature: {
        t1: 25 + Math.max(0, raw.temperature.t1 - 25) * ratio,
        t2: 25 + Math.max(0, raw.temperature.t2 - 25) * ratio,
      },
    },
    displayVibration: latestVibration * Math.pow(ratio, VIBRATION_RATIO_POWER),
  };
}
