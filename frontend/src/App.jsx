import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "../pages/Register"
import Login from "../pages/Login"
import Onboarding from "../pages/Onboarding"
import PrivateRoutes from "./components/PrivateRoutes"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/Onboarding" element={<Onboarding />} />
          <Route path="Dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App