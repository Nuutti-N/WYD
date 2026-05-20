import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"


function StatTile({ label, value }) {
    return (
        <div className="flex flex-col items-center">
            <p className="text-2xl font-bold text-white" >{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
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
        <div className="min-h-screen bg-gray-950 px-6 pt-22">
            <div className="w-full rounded-2xl bg-violet-800 border border-violet-700 p-4">
                <StatTile
                    label="Day Streak"
                    value={stats.streak}
                />
            </div>
            <div className="flex gap-4 mt-4">
                <div className="flex-1 bg-gray-800 rounded-2xl p-4">
                    <StatTile
                        label="XP"
                        value={stats.xp}
                    />
                </div>
                <div className="flex-1 bg-gray-800 rounded-2xl p-4">
                    <StatTile
                        label="Level"
                        value={stats.level}
                    />
                </div>
                <div className="flex-1 bg-gray-800 rounded-2xl p-4">
                    <StatTile
                        label="Hours"
                        value={stats.hours}
                    />
                </div>
            </div>
        </div>

    )

}

export default Home