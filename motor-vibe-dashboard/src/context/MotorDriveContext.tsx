import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MotorDriveContextValue = {
  motorOn: boolean;
  rpmSetpoint: number;
  effectiveRpm: number;
  setMotorOn: (v: boolean) => void;
  setRpmSetpoint: (v: number) => void;
  toggleMotor: () => void;
  applyFromTwin: (motorOn: boolean, rpmSetpoint: number) => void;
};

const MotorDriveContext = createContext<MotorDriveContextValue | null>(null);

export function MotorDriveProvider({ children }: { children: ReactNode }) {
  const [motorOn, setMotorOn] = useState(false);
  const [rpmSetpoint, setRpmSetpointState] = useState(1450);
  const [effectiveRpm, setEffectiveRpm] = useState(0);
  const speedRef = useRef(0);

  const setRpmSetpoint = useCallback((v: number) => {
    setRpmSetpointState(Math.max(0, Math.min(3000, Math.round(v))));
  }, []);

  const toggleMotor = useCallback(() => setMotorOn((m) => !m), []);

  const applyFromTwin = useCallback((on: boolean, rpm: number) => {
    setMotorOn(on);
    setRpmSetpointState(Math.max(0, Math.min(3000, Math.round(rpm))));
  }, []);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const target = motorOn ? (rpmSetpoint / 3000) * 0.3 : 0;
      const cur = speedRef.current;
      speedRef.current = cur + (target - cur) * 0.02;
      const er = Math.round((speedRef.current / 0.3) * 3000);
      setEffectiveRpm((prev) => (prev === er ? prev : er));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [motorOn, rpmSetpoint]);

  const value: MotorDriveContextValue = {
    motorOn,
    rpmSetpoint,
    effectiveRpm,
    setMotorOn,
    setRpmSetpoint,
    toggleMotor,
    applyFromTwin,
  };

  return <MotorDriveContext.Provider value={value}>{children}</MotorDriveContext.Provider>;
}

export function useMotorDrive(): MotorDriveContextValue {
  const ctx = useContext(MotorDriveContext);
  if (!ctx) throw new Error("useMotorDrive must be used within MotorDriveProvider");
  return ctx;
}
