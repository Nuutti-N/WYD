import { Link, useLocation } from "react-router-dom"
import { Home, PenLine, User, Route } from "lucide-react"


function Navbar() {
    const location = useLocation()



    function linkClass(path) {
        return location.pathname === path ? "text-violet-300 bg-purple-700 p-2 rounded-xl transition-all" : "text-gray-500 p-2 rounded-xl transition-all"
    }
    return (
        <nav className="fixed w-72 bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 border-gray-800 flex justify-around  py-4 rounded-2xl">
            <Link to="/Dashboard" className={`flex flex-col items-center gap-1 ${linkClass("/Dashboard")}`}><Home size={22} />
                <span className="text-sm font-medium">Home</span></Link>
            <Link to="/Path" className={`flex flex-col items-center gap-1 ${linkClass("/Path")}`}><Route size={22} /><span className="text-sm font-medium">Paths</span></Link>
            <Link to="/Logprogress" className={`${linkClass("/Logprogress")} flex flex-col items-center gap-1`}><PenLine size={22} />
                <span className="text-sm font-medium">Log</span>
            </Link>
            <Link to="/Profile" className={`${linkClass("/Profile")} flex flex-col items-center gap-1`}><User size={22} /> <span className="text-sm font-medium">Profile</span></Link>
        </nav>
    )

}


export default Navbar