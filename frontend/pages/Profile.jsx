import { useEffect, useState } from "react"
import api from "../api/client"
import { useNavigate } from "react-router-dom"

function StatTile({ value, label, valueClass, labelClass }) {
    return (
        <div>
            <p className={valueClass}>{value}</p>
            <p className={labelClass}>{label}</p>
        </div>

    )
}


function Profile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState(null)
    const [User, setUser] = useState("")
    const [category, setCategory] = useState("")

    useEffect(() => {
        async function fetchUser() {
            const response = await api.get("/me")
            setUser(response.data)

        }
        fetchUser()
        async function fetchCategory() {
            const response = await api.get("/dream_info")
            setCategory(response.data)


        }
        fetchCategory()
        async function fetchStats() {
            const response = await api.get("/checkins/stats")
            setStats(response.data)
        }
        fetchStats()
    }, [])

    if (!stats) return null
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center gap-4">
            <h1 className="text-white">
                <span className="">Profile</span>
            </h1>
            <div className="">
                <p className="">{User.username || User.username}</p>
                <p className="">
                    Level {stats.level} · {category.category} · {category.specific_items?.join(", ")}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 rounded-xl p-4 text-center">
                    <StatTile
                        label="streak"
                        value={stats.streak}
                        labelClass="text-xs text-zinc-500"
                        valueClass="text-xl font-medium text-white"
                    />
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 text-center">
                    <StatTile
                        label="total"
                        value={stats.hours}
                        labelClass="text-xs text-zinc-500"
                        valueClass="text-xl font-medium text-white"
                    />
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 text-center">
                    <StatTile
                        label="xp"
                        value={stats.xp}
                        labelClass="text-xs text-zinc-500"
                        valueClass="text-xl font-medium text-white"
                    />
                </div>
            </div>
            <div className="flex flex-col items-center mt-auto pb-24">
                <button
                    type="submit"
                    className="w-52 py-3 rounded-xl border border-zinc-700 bg-violet-700 text-zinc-300 text-sm hover:bg-violet-900 hover:text-white transition-colors"
                    onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/login")
                    }}>Sign out</button>
            </div>
        </div>
    )

}

export default Profile