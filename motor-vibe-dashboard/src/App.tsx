import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotorDriveProvider } from "@/context/MotorDriveContext";
import { AppShell } from "@/components/layout/AppShell";
import Index from "./pages/Index";
import Motor3DView from "./pages/Motor3DView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <MotorDriveProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Index />} />
              <Route path="3d-view" element={<Motor3DView />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </MotorDriveProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
