import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"


function Paths() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [paths, setPaths] = useState([])
    const [activeTab, setActiveTab] = useState("Explore")
    useEffect(() => {
        setLoading(true)
        async function fetchPaths() {
            try {
                const endpoint = activeTab === "Explore" ? "/paths" : "/paths/mine"
                const response = await api.get(endpoint)
                setPaths(response.data)
            } catch (err) {
                setError("No paths")
            }
            finally {
                setLoading(false)
            }
        }
        fetchPaths()
    }, [activeTab])


}

export default Paths