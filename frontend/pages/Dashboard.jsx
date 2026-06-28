import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"


function StatTile({ label, value }) {
    return (
        <div className="flex flex-col items-center">
            <p className=" text-2xl font-bold text-white" >{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    )
}

function getTimeOfDay() {
    const hour = new Date().getHours()
    return (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    )
}

function Home() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [user, setUser] = useState(null)
    const [dream, setDream] = useState(null)

    useEffect(() => {
        async function dashboard() {
            try {
                // run them all at once — faster than awaiting one by one.
                // /dream_info 404s if the user hasn't picked a dream yet,
                // so we guard it instead of failing the whole load.
                const [statsRes, meRes, dreamRes] = await Promise.all([
                    api.get("/checkins/stats"),
                    api.get("/me"),
                    api.get("/dream_info").catch(() => null),
                ])
                setStats(statsRes.data)
                setUser(meRes.data)
                if (dreamRes) setDream(dreamRes.data)
            } catch (err) {
                setError("Couldn't load your dashboard")
            } finally {
                setLoading(false)
            }
        }
        dashboard()
    }, [])

    if (!stats) return null

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <div className="px-6 max-w-md mx-auto pt-22 flex flex-col flex-1">
                <div className="">
                    <p className="text-zinc-500 text-base">{getTimeOfDay()}</p>
                    <h1 className="text-white font-semibold text-lg">WYD</h1>
                </div>
                {dream && dream.specific_items?.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">Your dream</p>
                        <p className="text-white font-semibold text-lg mt-1">
                            {dream.specific_items.join(" · ")}
                        </p>
                        <span className="inline-block text-xs text-gray-500 mt-2 px-2 py-0.5 rounded-full bg-zinc-800">{dream.category}</span>
                    </div>
                )}

                <div className="mt-4 w-full rounded-2xl bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] border border-purple-800 p-4 flex items-center justify-between ">
                    <StatTile
                        label="Day Streak"
                        value={stats.streak}
                    />
                    <div className="text-2xl">🔥</div>
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 bg-zinc-800 rounded-2xl p-4">
                        <StatTile
                            label="XP"
                            value={stats.xp}
                        />
                    </div>
                    <div className="flex-1 bg-zinc-800 rounded-2xl p-4">
                        <StatTile
                            label="Level"
                            value={stats.level}
                        />
                    </div>
                    <div className="flex-1 bg-zinc-800 rounded-2xl p-4">
                        <StatTile
                            label="Hours"
                            value={stats.hours}
                        />
                    </div>
                </div>
                <div className="rounded-2xl bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] border border-purple-600 p-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <p className="text-white">Level {stats.level} → {stats.level + 1}</p>
                        </div>
                        <div className="">
                            <p className="text-white">{stats.xp} / {stats.xp_next_level} XP </p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mt-3">
                        <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${((stats.xp - stats.xp_current_level) / (stats.xp_next_level - stats.xp_current_level)) * 100}%` }} />
                    </div>
                </div>
                <div className=" flex justify-center items-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/Logprogress")}
                        className="w-64 bg-gradient-to-r from-purple-700 to-purple-500 shadow-lg shadow-violet-500/40 text-white font-semibold py-3 rounded-xl transition "
                    > + Log today's Progress </button>
                </div>

            </div>
        </div>

    )

}

export default Home