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
                    <header className="flex flex-col gap-5 items-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold px-3 py-1 tracking-wide">
                            IDEA <span className="text-violet-400">→</span> EXECUTED
                        </span>
                        <h1 className="text-4xl font-semibold text-white leading-tight">Stop drifting. Find your path.</h1>
                        <p className="text-sm text-gray-400 leading-relaxed">Everyone takes the same path — school, job, repeat. WYD makes you chase what YOU want, and prove it every day.</p>
                    </header>

                    <div className="flex flex-col gap-3 mt-8 text-center">
                        <Link to="/Register" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-2xl transition">Start now — it's free</Link>
                        <div className="flex gap-1 justify-center text-sm text-gray-400">
                            <p> Already have an account?</p>
                            <Link to="/Login" className="text-violet-400 font-medium">Log in</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rolling activity strip */}
            <div className="border-y border-gray-800/60 bg-gray-900/40 py-3 overflow-hidden -mt-30 ">
                <div className="flex w-max animate-marquee whitespace-nowrap text-sm font-medium text-gray-400">
                    {[0, 1].map((dup) => (
                        <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                            {[
                                "Following their path daily",
                                "Uploading proof of work",
                                "Shipping every day",
                                "Hitting milestones",
                                "Proving progress, not promises",
                                "No shortcuts — real work",
                            ].map((phrase) => (
                                <span key={phrase} className="flex items-center">
                                    <span className="px-6">{phrase}</span>
                                    <span className="text-violet-500">•</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Placeholder sections — fill these in later */}
            <section id="edge" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">The Edge</h2>
                <p className="text-gray-400">Coming soon — what makes WYD different.</p>
            </section>

            <section id="journey" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">The Journey</h2>
                <p className="text-gray-400">Coming soon — pick a path, log daily, climb the leaderboard.</p>
            </section>

            <section id="premium" className="scroll-mt-20 max-w-3xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-3">WYD Premium</h2>
                <p className="text-gray-400">Coming soon — start free.</p>
            </section>
        </div>
    )
}


export default Landing
