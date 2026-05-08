import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictiveMaintenanceData, MotorData } from "@/types/motor";
import { buildPredictiveMaintenanceFromRanges } from "@/lib/predictiveFromRanges";

interface MaintenanceItem {
  component: string;
  status: "healthy" | "warning" | "critical";
  remainingLifeHours: number;
  recommendation: string;
}

interface PredictiveMaintenanceProps {
  motorData?: MotorData | null;
  predictiveMaintenance?: PredictiveMaintenanceData | null;
  /** RMS vibration (mm/s), aligned with the vibration chart */
  latestVibration?: number;
  /** VFD / shaft — predictive tiers & life estimates respond to speed */
  effectiveRpm?: number;
  motorOn?: boolean;
}

export function PredictiveMaintenance({
  motorData,
  predictiveMaintenance,
  latestVibration = 0,
  effectiveRpm = 0,
  motorOn = false,
}: PredictiveMaintenanceProps) {
  /** Bucket live readings + RPM so PM updates when VFD or gauges change */
  const rangeKey = useMemo(() => {
    if (!motorData) return "";
    const m = motorData;
    const rpmBucket = Math.round(effectiveRpm / 20) * 20;
    return [
      motorOn ? "1" : "0",
      String(rpmBucket),
      m.current.phaseA.toFixed(1),
      m.current.phaseB.toFixed(1),
      m.current.phaseC.toFixed(1),
      m.voltage.phaseA.toFixed(1),
      m.voltage.phaseB.toFixed(1),
      m.voltage.phaseC.toFixed(1),
      m.temperature.t1.toFixed(1),
      m.temperature.t2.toFixed(1),
      m.frequency.toFixed(2),
      (latestVibration ?? 0).toFixed(2),
    ].join("|");
  }, [motorData, latestVibration, effectiveRpm, motorOn]);

  const maintenanceData: MaintenanceItem[] = useMemo(() => {
    if (predictiveMaintenance?.components?.length) {
      return predictiveMaintenance.components.map((c) => ({
        component: c.component,
        status: c.status,
        remainingLifeHours: c.remainingLifeHours,
        recommendation: c.recommendation,
      }));
    }
    if (!motorData) return [];
    return buildPredictiveMaintenanceFromRanges(motorData, latestVibration ?? 0, {
      effectiveRpm,
      motorOn,
    });
  }, [predictiveMaintenance, motorData, latestVibration, effectiveRpm, motorOn, rangeKey]);

  const lastAnalysis = useMemo(() => {
    if (predictiveMaintenance?.lastAnalysis) {
      return new Date(predictiveMaintenance.lastAnalysis);
    }
    return new Date();
  }, [predictiveMaintenance?.lastAnalysis, rangeKey]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CircleCheck className="h-5 w-5 text-green-400" />;
      case "warning":
        return <CircleAlert className="h-5 w-5 text-yellow-400" />;
      case "critical":
        return <CircleAlert className="h-5 w-5 text-red-500 animate-pulse" />;
      default:
        return <CircleCheck className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTimeDisplay = (hours: number) => {
    if (hours < 24) return `${hours} hours`;
    if (hours < 168) return `${Math.round(hours / 24)} days`;
    return `${Math.round(hours / 168)} weeks`;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        Last analysis: {lastAnalysis.toLocaleTimeString()}
      </div>

      <div className="space-y-3">
        {maintenanceData.map((item, index) => (
          <Card
            key={`${item.component}-${index}`}
            className={cn(
              "p-3 sm:p-4 rounded-md bg-[#385b8a]/60 backdrop-blur border border-white/10 shadow-sm transition-all duration-300 hover:border-white/30",
              item.status === "critical"
                ? "border-l-4 border-l-red-500"
                : item.status === "warning"
                  ? "border-l-4 border-l-yellow-400"
                  : "border-l-4 border-l-green-400"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <h4 className="font-semibold text-white">{item.component}</h4>
                  <p className="text-xs text-white/70">
                    Est. remaining service life: {getTimeDisplay(item.remainingLifeHours)}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "text-xs px-3 py-1 rounded-full font-semibold tracking-wide",
                  item.status === "critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : item.status === "warning"
                      ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                )}
              >
                {item.status.toUpperCase()}
              </div>
            </div>

            <div className="mt-2 text-sm text-white/80">
              <span className="font-medium">Recommendation:</span> {item.recommendation}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
