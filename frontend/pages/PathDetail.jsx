import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/client"

function PathDetail() {
    const { id } = useParams()          // the :id from the URL /Path/:id
    const navigate = useNavigate()
    const [path, setPath] = useState(null)     // the one path we show
    const [owned, setOwned] = useState(false)  // do I already own it?
    const [openStep, setOpenStep] = useState(null)  // which step is expanded
    const [done, setDone] = useState([])       // indices of steps I've proven
    const [proofs, setProofs] = useState({})   // { "0": "https://...", ... } step -> proof url
    const [proofText, setProofText] = useState("")  // url being typed for the open step
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/paths/${id}`)        // get this path
                setPath(res.data)
                setDone(res.data.completed_steps || [])          // steps I proved
                setProofs(res.data.step_proofs || {})            // my proof links
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

    // The next step you're allowed to prove = the first one without a proof.
    // Steps before it are proven; steps after it are locked.
    function firstOpenStep() {
        let i = 0
        while (proofs[String(i)]) i++
        return i
    }

    // Submit Proof of Work for a step → unlocks the next one
    async function submitProof(i) {
        if (!owned || !proofText.trim()) return
        try {
            const res = await api.post(`/paths/${id}/steps/${i}/proof`, { proof_url: proofText.trim() })
            setDone(res.data.completed_steps || [])
            setProofs(res.data.step_proofs || {})
            setProofText("")                     // clear the input for the next step
            setError("")
        } catch (err) {
            setError(err.response?.data?.detail || "Couldn't submit proof. Try again.")
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

                {/* roadmap — tap a step to expand (accordion), tick the circle to complete */}
                {path.steps?.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-semibold">Roadmap</h3>
                            <span className="text-xs text-zinc-400">{done.length} / {path.steps.length} done</span>
                        </div>
                        {/* progress bar — fills as steps get checked off */}
                        <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                            <div className="bg-violet-500 h-2 rounded-full transition-all"
                                style={{ width: `${(done.length / path.steps.length) * 100}%` }} />
                        </div>
                        <div className="flex flex-col gap-2">
                            {path.steps.map((step, i) => {
                                const proven = Boolean(proofs[String(i)])
                                const locked = owned && !proven && i > firstOpenStep()
                                return (
                                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                    {/* step header — status circle + tappable title that opens/closes */}
                                    <div className="w-full flex items-center gap-3 p-4">
                                        <span
                                            className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${proven
                                                ? "bg-green-500 border-green-500 text-white"
                                                : locked
                                                    ? "border-zinc-700 text-zinc-600"
                                                    : "border-violet-500 text-transparent"}`}>
                                            {proven ? "✓" : locked ? "🔒" : ""}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setOpenStep(openStep === i ? null : i)}
                                            className="flex-1 flex items-center justify-between gap-3 text-left">
                                            <span className={`text-sm font-medium ${proven ? "text-zinc-500 line-through" : locked ? "text-zinc-500" : "text-white"}`}>
                                                <span className="text-violet-400">Step {i + 1}</span> · {step.title}
                                            </span>
                                            <span className="text-zinc-500 text-xs shrink-0">
                                                {step.hours ? `${step.hours}h ` : ""}{openStep === i ? "▾" : "▸"}
                                            </span>
                                        </button>
                                    </div>

                                    {/* step body — only shows when this step is open */}
                                    {openStep === i && (
                                        <div className="px-4 pb-4 flex flex-col gap-3 text-sm">
                                            {step.why && (
                                                <p className="text-zinc-400"><span className="text-zinc-200 font-medium">Why: </span>{step.why}</p>
                                            )}
                                            {step.instructions && (
                                                <p className="text-zinc-400"><span className="text-zinc-200 font-medium">How: </span>{step.instructions}</p>
                                            )}
                                            {step.deliverable && (
                                                <p className="text-green-400">✓ You'll have: {step.deliverable}</p>
                                            )}
                                            {step.tips && (
                                                <p className="text-violet-300">💡 {step.tips}</p>
                                            )}

                                            {/* Proof of Work — the gate to the next step */}
                                            {proven ? (
                                                <a href={proofs[String(i)]} target="_blank" rel="noreferrer"
                                                    className="text-green-400 underline break-all">
                                                    ✓ Proof submitted — view
                                                </a>
                                            ) : !owned ? (
                                                <p className="text-zinc-500 text-xs">Enroll to start proving your work.</p>
                                            ) : locked ? (
                                                <p className="text-zinc-500 text-xs">🔒 Prove the previous step to unlock this one.</p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-zinc-300 text-xs">Submit proof you did this (link to your repo, screenshot, video…)</p>
                                                    <input
                                                        value={proofText}
                                                        onChange={e => setProofText(e.target.value)}
                                                        placeholder="https://…"
                                                        className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-violet-500" />
                                                    <button
                                                        type="button"
                                                        onClick={() => submitProof(i)}
                                                        className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-lg text-sm transition">
                                                        Submit proof
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* sticky enroll button — always visible, even at the top */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 border-t border-zinc-800 p-4">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={enroll}
                        disabled={owned}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {owned ? "Enrolled ✓" : paid ? `Unlock €${path.price}` : "Start this path"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PathDetail
