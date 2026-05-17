import { Navigate, Outlet } from "react-router-dom"


function PrivateRoutes() {
    const token = localStorage.getItem('token')

    return (
        token ? <Outlet /> : <Navigate to="/Login" />

    )

}

export default PrivateRoutes