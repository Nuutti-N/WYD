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


}

export default PathDetail
