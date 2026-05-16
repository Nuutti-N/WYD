import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "../pages/Register"
import Login from "../pages/Login"
import PrivateRoutes from "./components/PrivateRoutes"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route elemen={<PrivateRoutes />}>
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )

}

export default App