import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { categories } from "../src/data/categories"

function Onboarding() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")
    const [category, setCategory] = useState("")
    const [focuses, setFocuses] = useState([])
    const [selectedFocus, setSelectedFocus] = useState("")
    async function handlesubmit(e) {

    }

    return (
        <div className="">
            <form className="">
                <div className="">
                </div>
                <div className="">
                    <span className={step >= 1 ? "text-primary" : ""}>01 . Dream</span>
                    <span>—</span>
                    <span className={step >= 2 ? "text-primary" : ""}>02 . Focus</span>
                </div>
                {step === 1 && (
                    <>
                        <h1 className=""> Where does your dream </h1>
                        <p className=""> Pick the category you actually care about. You can change it later.</p>
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
                        <h1 className="">
                            What will you focus on
                        </h1>
                        <p className="">
                            Pick at least one. choose one then you have better chance win!
                        </p>
                        <div className="">
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

                <div className="">
                    <button
                        type="button"
                        className=""
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else finish();
                        }}
                    >
                        {step === 1 ? "Continue" : "Continue"}
                    </button>
                </div>
            </form>
        </div >


    )

}

export default Onboarding