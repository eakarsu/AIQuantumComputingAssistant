import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import SettingsPage from './pages/SettingsPage';
import QuantumQueryPage from './pages/QuantumQueryPage';
import HardwareTranspilerPage from './pages/HardwareTranspilerPage';
import BenchmarkRunnerPage from './pages/BenchmarkRunnerPage';
import AlgorithmExplainerPage from './pages/AlgorithmExplainerPage';
import OptimizationProblemMapperPage from './pages/OptimizationProblemMapperPage';
import HardwareRecommendationPage from './pages/HardwareRecommendationPage';
import CircuitGeneratorPage from './pages/CircuitGeneratorPage';
import BenchmarkAnalysisPage from './pages/BenchmarkAnalysisPage';
import ErrorMitigationAdvisorPage from './pages/ErrorMitigationAdvisorPage';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';

// === Batch 07 Gaps & Frontend Mounts ===
import CfQuantumAlgorithmTutor from './pages/CfQuantumAlgorithmTutor';
import CfProblemtocircuitCompiler from './pages/CfProblemtocircuitCompiler';
import CfHardwareBenchmarkingDashboard from './pages/CfHardwareBenchmarkingDashboard';
import CfVariationalCircuitOptimizer from './pages/CfVariationalCircuitOptimizer';
import CfErrorMitigationAdvisor from './pages/CfErrorMitigationAdvisor';
import CfQuantumclassicalHybridPlanner from './pages/CfQuantumclassicalHybridPlanner';
import GapNoAlgorithmexplainerPlainenglishExplanati from './pages/GapNoAlgorithmexplainerPlainenglishExplanati';
import GapNoCircuitgeneratorFromProblemDescription from './pages/GapNoCircuitgeneratorFromProblemDescription';
import GapNoOptimizationproblemmapperClassicalQuant from './pages/GapNoOptimizationproblemmapperClassicalQuant';
import GapNoHardwarerecommendationIbmIonqRigettiR from './pages/GapNoHardwarerecommendationIbmIonqRigettiR';
import GapNoBenchmarkanalysisAcrossProviders from './pages/GapNoBenchmarkanalysisAcrossProviders';
import GapNoErrormitigationAdvisor from './pages/GapNoErrormitigationAdvisor';
import GapNoCircuitDiagramVisualizationeditor from './pages/GapNoCircuitDiagramVisualizationeditor';
import GapNoQuantumSimulatorIntegrationQiskitcirqb from './pages/GapNoQuantumSimulatorIntegrationQiskitcirqb';
import GapNoEducationalCourselessonStructure from './pages/GapNoEducationalCourselessonStructure';
import GapNoBenchmarkingFrameworkOrResultStore from './pages/GapNoBenchmarkingFrameworkOrResultStore';
import GapNoHardwareProviderAccountcredentialMgmt from './pages/GapNoHardwareProviderAccountcredentialMgmt';
import GapNoSavedCircuitsSharingOrLibrary from './pages/GapNoSavedCircuitsSharingOrLibrary';
import GapNoNotificationsOrRbac from './pages/GapNoNotificationsOrRbac';
// === End Batch 07 ===

import './styles/App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

            <Route
              path="/"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feature/:featureName"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FeaturePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quantum-query"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuantumQueryPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hardware-transpiler"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HardwareTranspilerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/benchmark-runner"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BenchmarkRunnerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/algorithm-explainer"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AlgorithmExplainerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/optimization-problem-mapper"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OptimizationProblemMapperPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hardware-recommendation"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HardwareRecommendationPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/circuit-generator"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CircuitGeneratorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/benchmark-analysis"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BenchmarkAnalysisPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/error-mitigation-advisor"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorMitigationAdvisorPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* === Batch 07 Gaps & Frontend Mounts === */}
            <Route path='/cf-quantum-algorithm-tutor' element={<ProtectedRoute><AppLayout><CfQuantumAlgorithmTutor /></AppLayout></ProtectedRoute>} />
            <Route path='/cf-problemtocircuit-compiler' element={<ProtectedRoute><AppLayout><CfProblemtocircuitCompiler /></AppLayout></ProtectedRoute>} />
            <Route path='/cf-hardware-benchmarking-dashboard' element={<ProtectedRoute><AppLayout><CfHardwareBenchmarkingDashboard /></AppLayout></ProtectedRoute>} />
            <Route path='/cf-variational-circuit-optimizer' element={<ProtectedRoute><AppLayout><CfVariationalCircuitOptimizer /></AppLayout></ProtectedRoute>} />
            <Route path='/cf-error-mitigation-advisor' element={<ProtectedRoute><AppLayout><CfErrorMitigationAdvisor /></AppLayout></ProtectedRoute>} />
            <Route path='/cf-quantumclassical-hybrid-planner' element={<ProtectedRoute><AppLayout><CfQuantumclassicalHybridPlanner /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-algorithmexplainer-plainenglish-explanati' element={<ProtectedRoute><AppLayout><GapNoAlgorithmexplainerPlainenglishExplanati /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-circuitgenerator-from-problem-description' element={<ProtectedRoute><AppLayout><GapNoCircuitgeneratorFromProblemDescription /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-optimizationproblemmapper-classical-quant' element={<ProtectedRoute><AppLayout><GapNoOptimizationproblemmapperClassicalQuant /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-hardwarerecommendation-ibm-ionq-rigetti-r' element={<ProtectedRoute><AppLayout><GapNoHardwarerecommendationIbmIonqRigettiR /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-benchmarkanalysis-across-providers' element={<ProtectedRoute><AppLayout><GapNoBenchmarkanalysisAcrossProviders /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-errormitigation-advisor' element={<ProtectedRoute><AppLayout><GapNoErrormitigationAdvisor /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-circuit-diagram-visualizationeditor' element={<ProtectedRoute><AppLayout><GapNoCircuitDiagramVisualizationeditor /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-quantum-simulator-integration-qiskitcirqb' element={<ProtectedRoute><AppLayout><GapNoQuantumSimulatorIntegrationQiskitcirqb /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-educational-courselesson-structure' element={<ProtectedRoute><AppLayout><GapNoEducationalCourselessonStructure /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-benchmarking-framework-or-result-store' element={<ProtectedRoute><AppLayout><GapNoBenchmarkingFrameworkOrResultStore /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-hardware-provider-accountcredential-mgmt' element={<ProtectedRoute><AppLayout><GapNoHardwareProviderAccountcredentialMgmt /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-saved-circuits-sharing-or-library' element={<ProtectedRoute><AppLayout><GapNoSavedCircuitsSharingOrLibrary /></AppLayout></ProtectedRoute>} />
            <Route path='/gap-no-notifications-or-rbac' element={<ProtectedRoute><AppLayout><GapNoNotificationsOrRbac /></AppLayout></ProtectedRoute>} />
            {/* === End Batch 07 === */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
