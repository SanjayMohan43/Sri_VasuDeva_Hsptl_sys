import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HospitalProvider } from "@/contexts/HospitalContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import QueuePage from "@/pages/QueuePage";
import TelemedicinePage from "@/pages/TelemedicinePage";
import PharmacyPage from "@/pages/PharmacyPage";
import DeliveryPage from "@/pages/DeliveryPage";
import MedicineRequestsPage from "@/pages/MedicineRequestsPage";
import StoreSettingsPage from "@/pages/StoreSettingsPage";
import ReportsPage from "@/pages/ReportsPage";
import ManageDoctorsPage from "@/pages/ManageDoctorsPage";
import ManagePatientsPage from "@/pages/ManagePatientsPage";
import SchedulePage from "@/pages/SchedulePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
    <Route path="/queue" element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
    <Route path="/telemedicine" element={<ProtectedRoute><TelemedicinePage /></ProtectedRoute>} />
    <Route path="/pharmacy" element={<ProtectedRoute><PharmacyPage /></ProtectedRoute>} />
    <Route path="/delivery" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
    <Route path="/medicine-requests" element={<ProtectedRoute><MedicineRequestsPage /></ProtectedRoute>} />
    <Route path="/store-settings" element={<ProtectedRoute><StoreSettingsPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
    <Route path="/manage-doctors" element={<ProtectedRoute><ManageDoctorsPage /></ProtectedRoute>} />
    <Route path="/manage-patients" element={<ProtectedRoute><ManagePatientsPage /></ProtectedRoute>} />
    <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <HospitalProvider>
            <AppRoutes />
          </HospitalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
