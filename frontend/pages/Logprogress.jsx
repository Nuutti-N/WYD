import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"

function Logprogress() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [hours, setHours] = useState(0)
    const [note, setNote] = useState("")
    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await api.post("/checkins", { hours, note })
            setHours(0)
            setNote("")
        }
        catch (err) {
            setError("Invalid, try again!")
        }
        finally {
            setLoading(false)
        }

    }


    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <form className="flex flex-col flex-1 gap-6 px-6 max-w-sm mx-auto" onSubmit={handleSubmit}>
                <header className="pt-12">
                    <h1 className="text-2xl font-bold text-white">Log Progress</h1>
                    <p className="text-sm text-gray-400 mt-1">Prove you put in the work</p>
                </header>
                <div className="flex items-center bg-gray-800 justify-between w-72 rounded-2xl px-4 h-40 border border-gray-700">
                    <button
                        type="button"
                        onClick={() => setHours(h => Math.max(0, h - 0.5))}
                        className="w-12 h-12 border border-gray-700 rounded-2xl bg-gray-800 text-white text-3xl">
                        -
                    </button>
                    <p className="text-white text-2xl font-bold w-20 text-center">{hours} hrs</p>
                    <button
                        type="button"
                        onClick={() => setHours(h => Math.min(6, h + 0.5))}
                        className="w-12 h-12 border border-gray-700 rounded-2xl bg-gray-800 text-white text-3xl">
                        +
                    </button>

                </div>
                <div className="flex flex-col items-center">
                    <textarea
                        minLength={20}
                        maxLength={300}
                        value={note}
                        placeholder="What did you actually do —— Be specific"
                        onChange={(e) => setNote(e.target.value)}
                        className="w-72 h-46 bg-gray-800 text-white rounded-2xl p-3 outline-none placeholder-gray-500 border border-gray-700 focus:border-violet-500 resize-none"
                    />

                </div>
                <div className="flex flex-col items-center mt-auto pb-24">
                    <button
                        type="submit"
                        className=" w-64 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/40 active:scale-95 text-white font-semibold py-3 rounded-xl transition mt-2"
                    >
                        Submit proof
                    </button>
                </div>

            </form>
        </div>


    )

}


export default Logprogress