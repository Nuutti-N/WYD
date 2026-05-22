import { useEffect, useState } from "react"
import api from "../api/client"

function StatTile({ value, label }) {
    return (
        <div>
            <p>{value}</p>
            <p>{label}</p>
        </div>

    )
}


function Profile() {
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
        <div className="">
            <h1 className="">
                <span className>Profile</span>
            </h1>

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

                <div>
                    <button
                        type="submit"
                        className="">Sign out</button>
                </div>
            </div>
        </div>
    )

}

export default Profile