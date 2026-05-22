import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Register from "../pages/Register"
import Login from "../pages/Login"
import Onboarding from "../pages/Onboarding"
import PrivateRoutes from "./components/PrivateRoutes"
import Dashboard from "../pages/Dashboard"
import Logprogress from "../pages/Logprogress"
import Profile from "../pages/Profile"
import Navbar from "../pages/Navbar"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/Onboarding" element={<Onboarding />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Logprogress" element={<Logprogress />} />
          <Route path="/Profile" element={<Profile />} />
        </Route>
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<Navigate to="/Register" />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App