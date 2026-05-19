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
    async function finish() {
        await api.post("/category", { params: { category } })
        await api.post("/specific-items", [selectedFocus])
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
                        <h1 className="text-3xl font-bold text-white"> Where does your dream </h1>
                        <p className="text-sm text-gray-400 mt-2"> Pick the category you actually care about. You can change it later.</p>
                        <div className="grid grid-cols-5 gap-3 mt-6">
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
                            What will you focus on
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">
                            Pick at least one. choose one then you have better chance win!
                        </p>
                        <div className="grid grid-cols-5 gap-3 mt-6">
                            {focuses.map((focus) =>
                                <button
                                    key={focus}
                                    type="button"
                                    onClick={() => { setSelectedFocus(focus) }}
                                    className={`p-4 rounded-2xl border text-white font-medium ${selectedFocus === focus ? "border-violet-500 bg-violet-600/20" : "border-gray-700 bg-gray-800"

                                        }`} >
                                    {focus}
                                </button>
                            )}
                        </div>

                    </>
                }

                <div className="mt-auto pt-8">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else finish();
                        }}
                        className="w-full py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base"
                    >
                        {step === 1 ? "Continue" : "Start my dream"}
                    </button>
                </div>
            </form>
        </div >


    )

}

export default Onboarding