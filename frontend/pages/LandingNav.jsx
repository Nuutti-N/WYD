import { Link } from "react-router-dom"

function LandingNav() {
    return (
        <header className="fixed top-0 left-0 w-full z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800/60">
            <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left: bold logo */}
                <a href="#top" className="text-2xl font-bold text-white tracking-tight">WYD</a>

                {/* Middle: desktop-only links with hover */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#edge" className="hover:text-white transition">The Edge</a>
                    <a href="#journey" className="hover:text-white transition">The Journey</a>
                    <a href="#premium" className="hover:text-white transition">WYD Premium</a>
                </div>

                {/* Right: secondary Log in + primary Start free */}
                <div className="flex items-center gap-3">
                    <Link to="/Login" className="text-sm font-medium text-gray-300 hover:text-white transition">Log in</Link>
                    <Link to="/Register" className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition">Start free</Link>
                </div>
            </nav>
        </header>
    )
}

export default LandingNav
