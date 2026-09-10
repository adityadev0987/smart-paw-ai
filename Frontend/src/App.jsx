import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/layout/Navbar"

import Home from "./pages/Home"
import AIHealthCheck from "./pages/AIHealthCheck"
import Planner from "./pages/Planner"
import BreedInsights from "./pages/BreedInsights"
import VetLocator from "./pages/VetLocator"
import Dashboard from "./pages/Dashboard"
import PetProfile from "./pages/PetProfile"
import HealthRecords from "./pages/HealthRecords"
import Recommendation from "./pages/Recommendation"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Notfound from "./pages/Notfound"

function AppContent() {
  const location = useLocation()

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register"

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/health-check" element={<AIHealthCheck />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/breed-insights" element={<BreedInsights />} />
        <Route path="/vet-locator" element={<VetLocator />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pet-profile" element={<PetProfile />} />
        <Route path="/health-records" element={<HealthRecords />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Notfound />} />
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