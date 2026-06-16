import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { categories } from "../src/data/categories"
import api from "../api/client"

function Onboarding() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")
    const [category, setCategory] = useState("")
    const [focuses, setFocuses] = useState([])
    const [selectedFocus, setSelectedFocus] = useState("")
    const [why, setWhy] = useState("")
    const [paths, setPaths] = useState([])     // roadmaps suggested in step 3

    // step 2 → save the dream, then load matching roadmaps and go to step 3
    async function saveDream() {
        try {
            await api.post("/category", null, { params: { category } })
            await api.post("/specific-items", [selectedFocus])
            // suggest roadmaps in the category they picked
            const res = await api.get("/paths")
            const mine = (res.data || []).filter(
                p => p.category?.toLowerCase() === category.toLowerCase())
            setPaths(mine)
            setStep(3)
        } catch (err) {
            setError("Couldn't save your dream. Try again.")
        }
    }

    // step 3 → enroll in a roadmap then head to the dashboard
    async function enrollAndGo(id) {
        try {
            await api.post(`/paths/${id}/buy`)
        } catch (err) {
            // even if enroll fails we don't want to trap them in onboarding
        }
        navigate("/Dashboard")
    }

    return (
        <div className="relative min-h-screen bg-gray-950">
            <form className="flex flex-col flex-1 px-6 py-10">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-8">
                    <span className={step >= 1 ? "text-violet-400 font-semibold" : "text-gray-500"}>01 . Dream</span>
                    <span className="text-gray-600">—</span>
                    <span className={step >= 2 ? "text-violet-400 font-semibold" : "text-gray-500"}>02 . Focus</span>
                    <span className="text-gray-600">—</span>
                    <span className={step >= 3 ? "text-violet-400 font-semibold" : "text-gray-500"}>03 . Roadmap</span>
                </div>

                {step === 1 && (
                    <>
                        {/* quick intro so a new user gets the idea before picking */}
                        <div className="rounded-2xl bg-violet-600/10 border border-violet-700/50 p-4 mb-6">
                            <p className="text-white font-semibold">Most people drift. You won't.</p>
                            <p className="text-sm text-gray-300 mt-1">
                                Pick your dream → follow a real roadmap → log daily and climb.
                            </p>
                        </div>

                        <h1 className="text-3xl font-bold text-white"> Where does your dream </h1>
                        <p className="text-sm text-gray-400 mt-2"> Pick the category you actually care about. You can change it later.</p>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            {categories.map((cat) => (
                                <button
                                    key={cat.label}
                                    type="button"
                                    onClick={() => { setCategory(cat.label); setFocuses(cat.focuses) }}
                                    className={`p-4 rounded-2xl border text-white font-medium ${category === cat.label ? "border-violet-500 bg-violet-600/20"
                                        : "border-gray-700 bg-gray-800"}`}
                                >
                                    {cat.label}
                                </button>
                            )

                            )}
                        </div>

                    </>

                )}
                {step === 2 &&
                    <>
                        <h1 className="text-3xl font-bold text-white">
                            Define your dream
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">
                            Be specific. Vague goals stay dreams.
                        </p>
                        <input
                            type="text"
                            value={selectedFocus}
                            onChange={(e) => setSelectedFocus(e.target.value)}
                            placeholder="What exactly do you want? e.g. Build my own iOS app"
                            className="mt-6 w-full p-4 rounded-2xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                        />

                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mt-6 mb-3">
                            Quick picks
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {focuses.map((focus) =>
                                <button
                                    key={focus}
                                    type="button"
                                    onClick={() => setSelectedFocus(focus)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium ${selectedFocus === focus ? "border-violet-500 bg-violet-600/20 text-white" : "border-gray-700 bg-gray-800 text-gray-300"}`}
                                >
                                    {focus}
                                </button>
                            )}
                        </div>

                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mt-6 mb-3">
                            Why? <span className="text-gray-600 normal-case">(optional)</span>
                        </p>
                        <textarea
                            value={why}
                            onChange={(e) => setWhy(e.target.value)}
                            placeholder="Why does this dream matter to you?"
                            rows={3}
                            className="w-full p-4 rounded-2xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 resize-none mb-40"
                        />
                    </>
                }

                {step === 3 &&
                    <>
                        <h1 className="text-3xl font-bold text-white">
                            Pick your roadmap
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">
                            A step-by-step path to your dream. Start one — you can switch later.
                        </p>

                        {paths.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-5">
                                <p className="text-gray-300 text-sm">
                                    No roadmaps for <span className="text-violet-300">{category}</span> yet.
                                    No worries — you can browse all roadmaps from the dashboard.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-6 mb-40">
                                {paths.map((path) => (
                                    <button
                                        key={path.id}
                                        type="button"
                                        onClick={() => enrollAndGo(path.id)}
                                        className="text-left rounded-2xl bg-zinc-800 border border-purple-800 p-4 hover:border-purple-600 transition"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-white font-semibold text-base leading-snug">{path.title}</h2>
                                            <span className="shrink-0 bg-purple-500/15 text-purple-300 font-semibold text-sm px-3 py-1 rounded-full">
                                                {path.price > 0 ? `€${path.price}` : "Free"}
                                            </span>
                                        </div>
                                        {path.achievements?.length > 0 && (
                                            <p className="text-green-400 text-sm mt-2">✓ You will achieve: {path.achievements[0]}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-3">
                                            <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">Mentor</span>
                                            <span className="text-zinc-300">{path.mentor_name}</span>
                                            <span>🔥 {path.mentor_streak || 0}</span>
                                            <span>👥 {path.enrolled || 0}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                }

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                <div className="flex flex-col items-center gap-3 fixed inset-x-0 bottom-0 z-30 pt-8 pb-8">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 1) setStep(2)
                            else if (step === 2) saveDream()
                            else navigate("/Dashboard")   // step 3 skip
                        }}
                        disabled={step === 1 ? !category : step === 2 ? !selectedFocus : false}
                        className="w-80 py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base disabled:opacity-40 shadow-lg shadow-violet-500/40"
                    >
                        {step === 3 ? "Skip for now" : "Continue"}
                    </button>
                </div>
            </form>
        </div >


    )

}

export default Onboarding
