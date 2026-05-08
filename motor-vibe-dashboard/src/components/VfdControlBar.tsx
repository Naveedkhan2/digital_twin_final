import { useMotorDrive } from "@/context/MotorDriveContext";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

export function VfdControlBar() {
  const { motorOn, rpmSetpoint, effectiveRpm, setRpmSetpoint, toggleMotor } = useMotorDrive();

  return (
    <div className="mb-6 rounded-xl border border-cyan-500/30 bg-[#121a2e]/90 px-4 py-4 shadow-[0_0_24px_rgba(0,242,255,0.08)]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <button
          type="button"
          onClick={toggleMotor}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm uppercase tracking-wide border transition-all shrink-0",
            motorOn
              ? "border-emerald-400 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-400/20"
              : "border-red-400/80 text-red-300 bg-red-500/10 hover:bg-red-400/20"
          )}
        >
          <Power className="h-4 w-4" />
          {motorOn ? "Power OFF" : "Power ON"}
        </button>

        <div className="flex-1 min-w-0">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/90">
              VFD speed — setpoint <span className="text-white font-mono">{rpmSetpoint}</span> RPM ·
              effective <span className="text-white font-mono">{effectiveRpm}</span> RPM
            </span>
            <input
              type="range"
              min={0}
              max={3000}
              value={rpmSetpoint}
              onChange={(e) => setRpmSetpoint(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-cyan-400 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
