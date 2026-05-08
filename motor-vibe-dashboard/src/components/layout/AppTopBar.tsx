import { HamburgerMenu } from "@/components/HamburgerMenu";
import { LiveStatus } from "@/components/LiveStatus";

interface AppTopBarProps {
  lastUpdated?: Date | null;
  /** Shown under the brand on secondary routes (e.g. 3D twin) */
  subLabel?: string;
}

export function AppTopBar({ lastUpdated, subLabel }: AppTopBarProps) {
  return (
    <header className="border-b border-white/10 bg-[#1a2644] shrink-0 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <HamburgerMenu />
          <div className="min-w-0 pt-0.5">
            <h1 className="text-base sm:text-xl font-bold text-white leading-snug">
              <span className="text-[#5eead4]">Epsilon AI</span>{" "}
              <span className="text-white/95 font-semibold">Motor Monitoring System</span>
            </h1>
            {subLabel ? (
              <p className="text-xs text-white/45 mt-1 font-medium tracking-wide">{subLabel}</p>
            ) : null}
          </div>
        </div>
        <LiveStatus lastUpdated={lastUpdated} />
      </div>
    </header>
  );
}
