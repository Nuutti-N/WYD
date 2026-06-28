import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"

function Logprogress() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [hours, setHours] = useState(0)
    const [note, setNote] = useState("")
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState("")

    function handleImage(e) {
        const file = e.target.files[0]
        if (!file) return
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    function removeImage() {
        if (preview) URL.revokeObjectURL(preview)
        setImage(null)
        setPreview("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            setError("")
            const fd = new FormData()
            fd.append("hours", hours)
            fd.append("note", note)
            fd.append("proof", image)
            await api.post("/checkins", fd)
            setHours(0)
            setNote("")
            setImage(null)
            setPreview("")
            navigate("/Dashboard")
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
                <div className="flex flex-col items-center">
                    {preview
                        ? <div className="relative w-72 h-40 rounded-2xl overflow-hidden border border-gray-700">
                            <img src={preview} alt="proof" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-lg leading-none">
                                ✕
                            </button>
                        </div>
                        : <label className="w-72 h-40 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer focus-within:border-violet-500">
                            <span className="text-gray-500 text-sm">+ Add a photo (proof)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                className="hidden"
                            />
                        </label>}
                </div>
                <div className="flex flex-col items-center mt-auto pb-32">
                    <button
                        type="submit"
                        disabled={!image || loading}
                        className=" w-64 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/40 active:scale-95 text-white font-semibold py-3 rounded-xl transition mt-2 disabled:opacity-40 disabled:active:scale-100"
                    >
                        Submit proof
                    </button>
                </div>
                {error &&
                    <p style={{ color: "red" }}>{error}</p>}

            </form>
        </div>


    )

}


export default Logprogress