import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "../pages/Register"
import Login from "../pages/Login"
import Onboarding from "../pages/Onboarding"
import PrivateRoutes from "./components/PrivateRoutes"
import Dashboard from "../pages/Dashboard"
import Logprogress from "../pages/Logprogress"
import Profile from "../pages/Profile"
import Navbar from "../pages/Navbar"
import Path from "../pages/Path"
import Landing from "../pages/Landing"
import PathDetail from "../pages/PathDetail"

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
          <Route path="/Path" element={<Path />} />
        </Route>
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="/Path/:id" element={<PathDetail />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App