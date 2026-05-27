import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
    return (hour < 12 ? "Good Morning" : hour < 18 ? "Good afternoon" : "Good evening"
    )
}

function Home() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        async function dashboard() {
            try {
                const response = await api.get("/checkins/stats")
                setStats(response.data)
            } catch (err) {
                setError("here is not stats")
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
                <div className="w-full rounded-2xl bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] border border-purple-800 p-4 flex items-center justify-between ">
                    <StatTile
                        label="Day Streak"
                        value={stats.streak}
                    />
                    <div className="text-2xl">🔥</div>
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] rounded-2xl p-4">
                        <StatTile
                            label="XP"
                            value={stats.xp}
                        />
                    </div>
                    <div className="flex-1 bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] rounded-2xl p-4">
                        <StatTile
                            label="Level"
                            value={stats.level}
                        />
                    </div>
                    <div className="flex-1 bg-[linear-gradient(135deg,#1a1730,#2a1f4a)] rounded-2xl p-4">
                        <StatTile
                            label="Hours"
                            value={stats.hours}
                        />
                    </div>
                </div>
                <div className="rounded-2xl border border-purple-600 p-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <p className="text-white">Level {stats.level}</p>
                        </div>
                        <div className="">
                            <p className="text-white">{stats.xp} / {stats.xp_next_level} XP </p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mt-3">
                        <div className="bg-violet-600 h-4 rounded-full" style={{ width: `${((stats.xp - stats.xp_current_level) / (stats.xp_next_level - stats.xp_current_level)) * 100}%` }} />
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