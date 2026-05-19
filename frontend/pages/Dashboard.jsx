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
        <div className="">
            <form className="">

                <div className="">
                    <p>Day Streak</p>
                    <StatTile
                        label="Streak"
                        value={stats.streak}
                        unit="days"
                        accent="streak"
                    />
                </div>

            </form>


        </div>

    )

}

export default Home