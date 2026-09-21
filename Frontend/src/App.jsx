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
import Recommendation from "./pages/Recommendation"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Notfound from "./pages/Notfound"

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAppContext()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  const location = useLocation()
  const { isAuthenticated } = useAppContext()

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register"

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
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
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