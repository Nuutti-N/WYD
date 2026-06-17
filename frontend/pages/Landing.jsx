import { Link } from 'react-router-dom'
import LandingNav from './LandingNav'

function Landing() {

    return (
        <div className="bg-gray-950 text-white">
            <LandingNav />

            {/* Hero */}
            <section id="top" className="min-h-screen flex flex-col justify-center px-6 pt-16 relative overflow-hidden text-center">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600 rounded-full blur-3xl opacity-60" />
                <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
                    <header className="flex flex-col gap-5">
                        <h1 className="text-4xl font-semibold text-white leading-tight">Find your direction</h1>
                        <p className="text-lg font-semibold text-violet-300">Try different paths, find what drives you and never look back.</p>
                    </header>

                    <div className="flex flex-col gap-3 mt-8 text-center">
                        <Link to="/Register" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-2xl transition">Get started</Link>
                        <div className="flex gap-1 justify-center text-sm text-gray-400">
                            <p> Already have an account?</p>
                            <Link to="/Login" className="text-violet-400 font-medium">Log in</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Placeholder sections — fill these in later */}
            <section id="features" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">Features</h2>
                <p className="text-gray-400">Coming soon — what makes WYD different.</p>
            </section>

            <section id="how" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
                <p className="text-gray-400">Coming soon — pick a path, log daily, climb the leaderboard.</p>
            </section>

            <section id="pricing" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">Pricing</h2>
                <p className="text-gray-400">Coming soon — start free.</p>
            </section>
        </div>
    )
}


export default Landing
