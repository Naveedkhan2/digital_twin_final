import React, { useCallback, useEffect, useRef } from "react";
import { useMotorData } from "@/hooks/useMotorData";
import { useMotorDrive } from "@/context/MotorDriveContext";
import { AppTopBar } from "@/components/layout/AppTopBar";

export default function Motor3DView() {
  const { motorData, vibrationData, lastUpdated } = useMotorData();
  const { motorOn, rpmSetpoint, applyFromTwin } = useMotorDrive();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const postDriveToIframe = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: "DRIVE_SYNC",
        motorOn,
        rpmSetpoint,
      },
      "*"
    );
  }, [motorOn, rpmSetpoint]);

  const postMotorData = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !motorData) return;

    const latestVibration =
      vibrationData.length > 0
        ? vibrationData[vibrationData.length - 1]?.value ?? null
        : null;

    iframe.contentWindow.postMessage(
      {
        type: "MOTOR_DATA",
        motorData: {
          current: motorData.current,
          voltage: motorData.voltage,
          frequency: motorData.frequency,
          temperature: motorData.temperature,
        },
        latestVibration,
      },
      "*"
    );
  }, [motorData, vibrationData]);

  useEffect(() => {
    postMotorData();
  }, [postMotorData]);

  useEffect(() => {
    postDriveToIframe();
  }, [postDriveToIframe]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "DRIVE_LOCAL") {
        applyFromTwin(!!e.data.motorOn, Number(e.data.rpmSetpoint) || 0);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [applyFromTwin]);

  return (
    <div className="min-h-screen flex flex-col bg-company-gradient text-white">
      <AppTopBar lastUpdated={lastUpdated} subLabel="3D Digital Twin" />
      <main className="flex-1 min-h-0 w-full flex flex-col">
        <iframe
          ref={iframeRef}
          src="/motor-diagnostic-lab.html"
          title="3D Motor Diagnostic Lab"
          className="w-full flex-1 min-h-0 border-0 block bg-[#121212]"
          onLoad={() => {
            postDriveToIframe();
            postMotorData();
          }}
        />
      </main>
    </div>
  );
}
