import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BrandManagementPage from './pages/BrandManagementPage';
import ImpersonationRadarPage from './pages/ImpersonationRadarPage';
import ScamDNAPage from './pages/ScamDNAPage';
import AppInspectorPage from './pages/AppInspectorPage';
import ThreatGraphPage from './pages/ThreatGraphPage';
import CampaignClusterPage from './pages/CampaignClusterPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import InvestigationHistoryPage from './pages/InvestigationHistoryPage';
import DetectionLabPage from './pages/DetectionLabPage';
import CopilotPage from './pages/CopilotPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="brands" element={<BrandManagementPage />} />
            <Route path="radar" element={<ImpersonationRadarPage />} />
            <Route path="scam" element={<ScamDNAPage />} />
            <Route path="apps" element={<AppInspectorPage />} />
            <Route path="graph" element={<ThreatGraphPage />} />
            <Route path="clusters" element={<CampaignClusterPage />} />
            <Route path="twin" element={<DigitalTwinPage />} />
            <Route path="vault" element={<EvidenceVaultPage />} />
            <Route path="history" element={<InvestigationHistoryPage />} />
            <Route path="lab" element={<DetectionLabPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
