import type { MotorData } from "@/types/motor";

/** Matches GaugeMetric / TemperatureMetric on the dashboard */
export const OPERATING_RANGE = {
  current: { min: 0, max: 100, warnMin: 60, warnMax: 85 },
  voltage: { min: 340, max: 420, warnMin: 370, warnMax: 400 },
  temperature: { warn: 75, critical: 85 },
  vibration: { warn: 2.8, critical: 4.5 },
} as const;

export type PMStatus = "healthy" | "warning" | "critical";

/** VFD / shaft speed — drives extra mechanical & thermal stress on top of scaled telemetry */
export interface RpmDriveContext {
  effectiveRpm: number;
  motorOn: boolean;
}

function worstStatus(...statuses: PMStatus[]): PMStatus {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "healthy";
}

/** 0 = idle/off, 1 = max slider RPM */
function rpmLoadFactor(drive?: RpmDriveContext): number {
  if (!drive?.motorOn) return 0;
  return Math.min(1, Math.max(0, drive.effectiveRpm / 3000));
}

function classifyGaugePhase(
  value: number,
  min: number,
  max: number,
  warnLow: number,
  warnHigh: number
): PMStatus {
  const span = Math.max(max - min, 1e-6);
  const innerMargin = span * 0.04;
  const outerCritical = span * 0.085;

  if (value < min || value > max) return "critical";

  if (value < warnLow - outerCritical || value > warnHigh + outerCritical) return "critical";

  if (value < warnLow || value > warnHigh) return "warning";

  const marginLow = value - warnLow;
  const marginHigh = warnHigh - value;
  if (marginLow <= innerMargin || marginHigh <= innerMargin) return "warning";

  return "healthy";
}

function phaseImbalancePct(phases: number[]): number {
  const avg = phases.reduce((a, b) => a + b, 0) / 3;
  if (avg < 0.05) return 0;
  const maxDev = Math.max(...phases.map((p) => Math.abs(p - avg)));
  return (maxDev / avg) * 100;
}

function imbalanceStatusFromPct(pct: number): PMStatus {
  if (pct >= 11) return "critical";
  if (pct >= 5) return "warning";
  return "healthy";
}

function perPhaseWorst(
  phases: number[],
  cfg: { min: number; max: number; warnMin: number; warnMax: number }
): PMStatus {
  const statuses = phases.map((v) =>
    classifyGaugePhase(v, cfg.min, cfg.max, cfg.warnMin, cfg.warnMax)
  );
  return worstStatus(...statuses);
}

function temperatureStatus(t1: number, t2: number): PMStatus {
  const t = Math.max(t1, t2);
  const { warn, critical } = OPERATING_RANGE.temperature;
  const approach = 3;

  if (t >= critical) return "critical";
  if (t >= warn) return "warning";
  if (t >= warn - approach) return "warning";
  return "healthy";
}

function vibrationStatus(v: number): PMStatus {
  const { warn, critical } = OPERATING_RANGE.vibration;
  const approach = 0.35;

  if (v >= critical) return "critical";
  if (v >= warn) return "warning";
  if (v >= warn - approach) return "warning";
  return "healthy";
}

function hoursFromTemp(maxT: number): number {
  const { warn, critical } = OPERATING_RANGE.temperature;
  if (maxT >= critical) return Math.max(24, Math.round(400 - (maxT - warn) * 35));
  if (maxT >= warn - 3) return Math.max(72, Math.round(960 - (maxT - 50) * 22));
  return Math.round(2400 - (maxT - 40) * 18);
}

function hoursFromVibration(v: number): number {
  const { warn, critical } = OPERATING_RANGE.vibration;
  if (v >= critical) return Math.max(24, Math.round(200 - (v - warn) * 45));
  if (v >= warn - 0.35) return Math.max(96, Math.round(640 - (v - 1.2) * 95));
  return Math.round(2000 - v * 140);
}

function hoursFromPhaseCombined(combined: PMStatus, imbPct: number): number {
  if (combined === "critical") return Math.max(36, Math.round(160 - imbPct * 5));
  if (combined === "warning") return Math.max(120, Math.round(560 - imbPct * 14));
  return Math.round(2600 - imbPct * 10);
}

export interface LocalMaintenanceRow {
  component: string;
  status: PMStatus;
  remainingLifeHours: number;
  recommendation: string;
}

/**
 * @param vibrationMmS — already RPM-scaled if coming from dashboard hook (matches gauges)
 * @param drive — optional VFD context: raises mechanical severity at higher RPM / when running
 */
export function buildPredictiveMaintenanceFromRanges(
  motor: MotorData,
  vibrationMmS: number,
  drive?: RpmDriveContext
): LocalMaintenanceRow[] {
  const rpm = rpmLoadFactor(drive);
  const on = drive?.motorOn ?? false;
  const rpmLabel = on ? ` · ~${Math.round(drive?.effectiveRpm ?? 0)} RPM` : " · motor off / standby";

  /** Extra severity at high speed (bearing stress), applied to tier classification */
  const mechStress = on ? 0.82 + 0.38 * rpm : 0.3;
  const vibForTier = vibrationMmS * mechStress;

  /** Imbalance electrically “hurts” more as slip frequency rises */
  const imbPctRaw = phaseImbalancePct([
    motor.current.phaseA,
    motor.current.phaseB,
    motor.current.phaseC,
  ]);
  const imbPctEffective = imbPctRaw * (on ? 1 + 0.28 * rpm : 0.82);
  const imbStatus = imbalanceStatusFromPct(imbPctEffective);

  const rangeI = perPhaseWorst(
    [motor.current.phaseA, motor.current.phaseB, motor.current.phaseC],
    OPERATING_RANGE.current
  );
  const rangeV = perPhaseWorst(
    [motor.voltage.phaseA, motor.voltage.phaseB, motor.voltage.phaseC],
    OPERATING_RANGE.voltage
  );
  const phaseCombined = worstStatus(imbStatus, rangeI, rangeV);

  /** Rotor windage / friction proxy — small thermal lift at high RPM for PM tier only */
  const tempBoost = on ? 3.2 * rpm : 0;
  const maxT = Math.max(
    motor.temperature.t1 + tempBoost * 0.55,
    motor.temperature.t2 + tempBoost * 0.55
  );
  const tempS = temperatureStatus(
    motor.temperature.t1 + tempBoost * 0.55,
    motor.temperature.t2 + tempBoost * 0.55
  );

  const vibS = vibrationStatus(vibForTier);

  /** Faster wear model at higher RPM */
  const wearFactor = on ? 1 + 0.55 * rpm : 1;

  const imbPctRounded = Math.round(imbPctRaw * 10) / 10;
  const imbEffRounded = Math.round(imbPctEffective * 10) / 10;

  const bearing: LocalMaintenanceRow = {
    component: "Bearing Assembly",
    status: vibS,
    remainingLifeHours: Math.max(12, Math.round(hoursFromVibration(vibrationMmS) / wearFactor)),
    recommendation:
      vibS === "critical"
        ? `Vibration ${vibrationMmS.toFixed(2)} mm/s (RPM-adjusted stress)${rpmLabel} — critical; inspect bearings`
        : vibS === "warning"
          ? `Vibration ${vibrationMmS.toFixed(2)} mm/s — elevated for current speed${rpmLabel}; schedule bearing check`
          : `Vibration ${vibrationMmS.toFixed(2)} mm/s — acceptable at current speed${rpmLabel}`,
  };

  const winding: LocalMaintenanceRow = {
    component: "Winding Insulation",
    status: tempS,
    remainingLifeHours: Math.max(12, Math.round(hoursFromTemp(maxT) / wearFactor)),
    recommendation:
      tempS === "critical"
        ? `Peak ~${maxT.toFixed(1)} °C (incl. speed-related heating)${rpmLabel} — critical; reduce load`
        : tempS === "warning"
          ? `Peak ~${maxT.toFixed(1)} °C${rpmLabel} — monitor thermals vs ${OPERATING_RANGE.temperature.warn} °C warning`
          : `Peak ~${maxT.toFixed(1)} °C${rpmLabel} — thermally comfortable`,
  };

  const balancing: LocalMaintenanceRow = {
    component: "Phase Balancing",
    status: phaseCombined,
    remainingLifeHours: Math.max(
      12,
      Math.round(hoursFromPhaseCombined(phaseCombined, imbPctEffective) / wearFactor)
    ),
    recommendation:
      phaseCombined === "critical"
        ? `Effective imbalance ${imbEffRounded}% (raw ${imbPctRounded}%)${rpmLabel} — critical; inspect electrical balance`
        : phaseCombined === "warning"
          ? `Effective imbalance ${imbEffRounded}%${rpmLabel} — schedule phase / supply review`
          : `Imbalance ${imbPctRounded}%${rpmLabel}; phases within current/voltage bands`,
  };

  return [bearing, winding, balancing];
}
