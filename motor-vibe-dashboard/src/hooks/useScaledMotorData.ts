import { useMemo } from "react";
import { useMotorData } from "@/hooks/useMotorData";
import { useMotorDrive } from "@/context/MotorDriveContext";
import { getRpmRatio, scaleMotorData } from "@/lib/motorScaling";

/**
 * Firebase motor data scaled the same way as the 3D diagnostic lab tooltips (RPM / VFD ratio).
 */
export function useScaledMotorData() {
  const raw = useMotorData();
  const drive = useMotorDrive();

  const ratio = useMemo(() => {
    if (!raw.motorData) return 0;
    return getRpmRatio({
      effectiveRpm: drive.effectiveRpm,
      motorOn: drive.motorOn,
      baseHz: raw.motorData.frequency,
    });
  }, [raw.motorData, drive.effectiveRpm, drive.motorOn]);

  const scaledMotorData = useMemo(() => {
    if (!raw.motorData) return null;
    const lastVib =
      raw.vibrationData.length > 0
        ? raw.vibrationData[raw.vibrationData.length - 1]!.value
        : 2.5;
    return scaleMotorData(raw.motorData, ratio, drive.motorOn, lastVib).motorData;
  }, [raw.motorData, ratio, drive.motorOn, raw.vibrationData]);

  const scaledVibrationData = useMemo(() => {
    const vibPow = 1.25;
    return raw.vibrationData.map((d) => ({
      ...d,
      value: drive.motorOn ? d.value * Math.pow(ratio, vibPow) : d.value * 0.05,
    }));
  }, [raw.vibrationData, ratio, drive.motorOn]);

  return {
    ...raw,
    motorData: scaledMotorData,
    vibrationData: scaledVibrationData,
    driveRatio: ratio,
  };
}
