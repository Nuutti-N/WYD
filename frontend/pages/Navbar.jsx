import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

function Navbar() {
    const location = useLocation()
    const [Loading, setLoading] = useState(false)
    const [error, setError] = useState("")


    function linkClass(path) {
        return location.pathname === path ? "text-violet-400" : "text-gray-500"
    }
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around  py-4 rounded-2xl">
            <Link to="/Dashboard" className={`${linkClass("/Dashboard")} text-sm font-medium px-4 py-2`}>Home</Link>
            <Link to="/Logprogress" className={`${linkClass("/Logprogress")} text-sm font-medium px-4 py-2`}>Log</Link>
            <Link to="/Profile" className={`${linkClass("/Profile")} text-sm font-medium px-4 py-2`}>Profile</Link>
        </nav>
    )

}


export default Navbar