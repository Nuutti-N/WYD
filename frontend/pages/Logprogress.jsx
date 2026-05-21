import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"

function Logprogress() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [hours, setHours] = useState(0)
    const [note, setNote] = useState("")
    async function handleSubmit() {
        try {
            await api.post("/checkins", { hours, note })
        }
        catch (err) {
            setError("Invalid, try again!")
        }
        finally {
            setLoading(false)
        }

    }


    return (
        <div className="">
            <form className="">
                <div className="">
                    <h1 className="">Log Progress</h1>
                    <p className="">Prove you put in the work</p>
                </div>


                <button
                    type="submit"
                    className="w-64 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/40 active:scale-95 text-white font-semibold py-3 rounded-xl transition mt-2"
                >
                    Submit proof
                </button>

            </form>
        </div>


    )

}


export default Logprogress