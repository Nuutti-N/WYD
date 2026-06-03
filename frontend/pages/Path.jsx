import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"


function Paths() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [paths, setPaths] = useState([])
    const [activeTab, setActiveTab] = useState("Explore")
    const [search, setSearch] = useState("")
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

    return (
        <div className="">
            <h1 className="">Paths</h1>

            <input className=""
                value={search}
                placeholder="Search paths"
                onChange={e => setSearch(e.target.value)}
            />
            <div className="bg-950-gray">
                {paths.map(path => (
                    <div key={path.id}>
                        <h2>{path.title}</h2>
                        <p>{path.category}</p>
                        <p>{path.price}</p>
                        <p>{path.description}</p>

                    </div>
                ))}
            </div>

        </div>

    )

}

export default Paths