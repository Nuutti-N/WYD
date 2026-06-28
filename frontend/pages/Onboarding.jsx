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

    // step 2 → save the dream, then head straight to the dashboard
    async function saveDream() {
        try {
            await api.post("/category", null, { params: { category } })
            await api.post("/specific-items", [selectedFocus])
            navigate("/Dashboard")
        } catch (err) {
            setError("Couldn't save your dream. Try again.")
        }
    }

    return (
        <div className="relative min-h-screen bg-gray-950">
            <form className="flex flex-col flex-1 px-6 py-10">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-8">
                    <span className={step >= 1 ? "text-violet-400 font-semibold" : "text-gray-500"}>01 . Dream</span>
                    <span className="text-gray-600">—</span>
                    <span className={step >= 2 ? "text-violet-400 font-semibold" : "text-gray-500"}>02 . Focus</span>
                </div>

                {step === 1 && (
                    <>
                        {/* quick intro so a new user gets the idea before picking */}
                        <div className="rounded-2xl bg-violet-600/10 border border-violet-700/50 p-4 mb-6">
                            <p className="text-white font-semibold">Most people drift. You won't.</p>
                            <p className="text-sm text-gray-300 mt-1">
                                Pick your dream → prove it every day → keep your streak alive.
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

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                <div className="flex flex-col items-center gap-3 fixed inset-x-0 bottom-0 z-30 pt-8 pb-8">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 1) setStep(2)
                            else saveDream()
                        }}
                        disabled={step === 1 ? !category : !selectedFocus}
                        className="w-80 py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base disabled:opacity-40 shadow-lg shadow-violet-500/40"
                    >
                        {step === 1 ? "Continue" : "Start proving"}
                    </button>
                </div>
            </form>
        </div >


    )

}

export default Onboarding
