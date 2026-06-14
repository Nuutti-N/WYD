import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/client"

function PathDetail() {
    const { id } = useParams()          // the :id from the URL /Path/:id
    const navigate = useNavigate()
    const [path, setPath] = useState(null)     // the one path we show
    const [owned, setOwned] = useState(false)  // do I already own it?
    const [openStep, setOpenStep] = useState(null)  // which step is expanded
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/paths/${id}`)        // get this path
                setPath(res.data)
                const ownedRes = await api.get("/paths/owned")   // get my owned ids
                setOwned((ownedRes.data || []).includes(Number(id)))
            } catch (err) {
                setError("Couldn't load this path.")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    async function enroll() {
        try {
            await api.post(`/paths/${id}/buy`)   // unlock it
            setOwned(true)                       // flip button to "Enrolled"
        } catch (err) {
            setError("Couldn't enroll. Try again.")
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-950 text-zinc-500 flex items-center justify-center">Loading…</div>
    )
    if (error || !path) return (
        <div className="min-h-screen bg-gray-950 text-center pt-24 px-6">
            <p className="text-red-400 text-sm">{error || "Not found"}</p>
            <button onClick={() => navigate("/Path")} className="text-violet-400 mt-4">← Back to paths</button>
        </div>
    )

    const paid = path.price > 0

    return (
        <div className="min-h-screen bg-gray-950">
            {/* pb-28 leaves empty room so the sticky button never covers content */}
            <div className="px-6 max-w-md mx-auto pt-16 pb-28">

                <button onClick={() => navigate("/Path")} className="text-zinc-400 text-sm mb-4">← Back</button>

                {/* title + price/Free badge */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-white font-bold text-2xl leading-tight">{path.title}</h1>
                    <span className="shrink-0 bg-purple-500/15 text-purple-300 font-semibold text-sm px-3 py-1 rounded-full">
                        {paid ? `€${path.price}` : "Free"}
                    </span>
                </div>

                {/* category · difficulty */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-purple-400 text-xs font-medium uppercase tracking-wide">{path.category}</span>
                    {path.difficulty && <span className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{path.difficulty}</span>}
                </div>

                {/* mentor proof */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-4">
                    <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">Mentor</span>
                    <span className="text-zinc-300">{path.mentor_name}</span>
                    <span>🔥 {path.mentor_streak || 0}</span>
                    <span>⏱ {path.mentor_hours || 0}h</span>
                </div>

                {/* path stats */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                    {path.total_hours ? <span>⏱ {path.total_hours}h total</span> : null}
                    <span>👥 {path.enrolled || 0} enrolled</span>
                </div>

                <p className="text-zinc-400 text-sm mt-4">{path.description}</p>

                {/* what you'll achieve (green) */}
                {path.achievements?.length > 0 && (
                    <div className="bg-green-500/10 border border-green-700 rounded-2xl p-4 mt-5">
                        <h3 className="text-green-400 font-semibold text-sm mb-2">What you'll achieve</h3>
                        <ul className="flex flex-col gap-1">
                            {path.achievements.map((a, i) => (
                                <li key={i} className="text-green-300 text-sm flex gap-2">
                                    <span>✓</span><span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* prerequisites (yellow) */}
                {path.prerequisites?.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-700 rounded-2xl p-4 mt-4">
                        <h3 className="text-yellow-400 font-semibold text-sm mb-2">Prerequisites</h3>
                        <ul className="flex flex-col gap-1">
                            {path.prerequisites.map((p, i) => (
                                <li key={i} className="text-yellow-200 text-sm flex gap-2">
                                    <span>•</span><span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* piece 4: roadmap accordion goes here */}

            </div>
        </div>
    )
}

export default PathDetail
