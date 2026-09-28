import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import { useAppContext } from "./hooks/useAppContext"

import Home from "./pages/Home"
import AIHealthCheck from "./pages/AIHealthCheck"
import Planner from "./pages/Planner"
import BreedInsights from "./pages/BreedInsights"
import VetLocator from "./pages/VetLocator"
import Dashboard from "./pages/Dashboard"
import PetProfile from "./pages/PetProfile"
import Community from "./pages/Community"
import DoctorConsultation from "./pages/DoctorConsultation"
import Recommendation from "./pages/Recommendation"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Notfound from "./pages/Notfound"
import DoctorDashboard from "./pages/DoctorDashboard"
import DoctorRegister from "./pages/DoctorRegister"
import DoctorConsultationDetail from "./pages/DoctorConsultationDetail"
import DoctorConsultationReport from "./pages/DoctorConsultationReport"
import ConsultationReportView from "./pages/ConsultationReportView"

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isAuthChecking, currentUser } = useAppContext()

  if (isAuthChecking) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const doctorPath = location.pathname === "/doctor/dashboard" || location.pathname === "/planner" || /^\/doctor\/consultations\/[^/]+(?:\/report)?$/.test(location.pathname)
  if (currentUser?.role === "doctor" && !doctorPath) return <Navigate to="/doctor/dashboard" replace />
  if (currentUser?.role !== "doctor" && (location.pathname.startsWith("/doctor/dashboard") || location.pathname.startsWith("/doctor/consultations"))) return <Navigate to="/dashboard" replace />

  return children
}

function AppContent() {
  const location = useLocation()
  const { isAuthenticated } = useAppContext()

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" || location.pathname === "/doctor/register"

  return (
    <>
      {(!isAuthenticated || !hideNavbar) && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/health-check"
          element={
            <ProtectedRoute>
              <AIHealthCheck />
            </ProtectedRoute>
          }
        />
        <Route path="/consultations" element={<ProtectedRoute><DoctorConsultation /></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/consultations/:consultationId" element={<ProtectedRoute><DoctorConsultationDetail /></ProtectedRoute>} />
        <Route path="/doctor/consultations/:consultationId/report" element={<ProtectedRoute><DoctorConsultationReport /></ProtectedRoute>} />
        <Route path="/consultations/:consultationId/report" element={<ProtectedRoute><ConsultationReportView /></ProtectedRoute>} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/breed-insights"
          element={
            <ProtectedRoute>
              <BreedInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vet-locator"
          element={
            <ProtectedRoute>
              <VetLocator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pet-profile"
          element={
            <ProtectedRoute>
              <PetProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-records"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/posts/:postId"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route path="/adoption" element={<Navigate to="/community?section=adoption" replace />} />
        <Route
          path="/recommendation"
          element={
            <ProtectedRoute>
              <Recommendation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendation />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={
            isAuthenticated ? <Notfound /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
