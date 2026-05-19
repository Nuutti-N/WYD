import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"


function StatTile({ label, value, unit, accent }) {
    return (
        <div>
            <p>{label}</p>
            <p>{value}</p>
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
        <div className="min-h-screen bg-gray-950 flex justify-center px-6">
            <div className=" w-56 mt-12 border border-violet-700 rounded-2xl p-4 bg-violet-800">
                <StatTile
                    label="Day Streak"
                    value={stats.streak}
                    unit="days"
                    accent="streak"
                />
            </div>
            <div className="">
                <p>Hours</p>
                <StatTile
                    label="XP"
                    value={stats.xp}
                    unit="xp"
                    accent="xp "
                />
            </div>
            <div className="">
                <StatTile
                    label="Level"
                    value={stats.level}
                />
            </div>
            <div className="">
                <StatTile
                    label="Hours"
                    value={stats.hours}
                />
            </div>
        </div>

    )

}

export default Home