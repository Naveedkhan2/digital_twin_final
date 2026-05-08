import React from "react";
import { AppTopBar } from "@/components/layout/AppTopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: Date | null;
}

export const DashboardLayout = ({ children, title, lastUpdated }: DashboardLayoutProps) => {
  return (
    <div className="min-h-full flex flex-col text-white">
      <AppTopBar lastUpdated={lastUpdated} />
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-white/60 mt-1.5">Real-time monitoring and analytics</p>
        </div>
        {children}
      </div>
    </div>
  );
};
