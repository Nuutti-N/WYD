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
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
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
    async function createPath() {
        const response = await api.post("/paths", { title, description, category, price })
        setTitle("")
        setDescription("")
        setCategory("")
        setPrice("")
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <div className="px-6 max-w-md mx-auto pt-20 flex flex-col flex-1">
                <h1 className="text-white font-semibold text-lg">Explore Paths</h1>
                <div className="bg-zinc-800 rounded-xl px-4 py-3 mt-4 mb-6">
                    <input
                        value={search}
                        placeholder="Search paths"
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-white w-full outline-none text-sm"
                    />
                </div>
                <div className="flex justify-center gap-6 border-b border-zinc-800 mt-4 mb-4">
                    <button onClick={() => setActiveTab("Explore")} className={` pb-2 text-base ${activeTab === 'Explore' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500'}`}>Explore</button>
                    <button onClick={() => setActiveTab("Mine")} className={` pb-2 text-base ${activeTab === 'Mine' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500'}`}>My paths</button>
                    <button onClick={() => setActiveTab("Create")} className={` pb-2 text-base ${activeTab === 'Create' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500'}`}> Create</button>

                </div>
                {activeTab === "Create" && (<div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-300">Title</label>
                    <input
                        value={title}
                        placeholder="e.g. 0 to junior dev in 6 months"
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-gray-800 text-zinc-400 placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <input
                        value={description}
                        placeholder="Tell people what they'll learn from your path..."
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-gray-800 text-zinc-400 placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                    <label className="text-sm font-medium text-gray-300">Category</label>
                    <input
                        value={category}
                        placeholder="Tech, Business, Fitness..."
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-gray-800 text-zinc-400 placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                    <label className="text-sm font-medium text-gray-300">Price €</label>
                    <input
                        value={price}
                        placeholder="19"
                        onChange={e => setPrice(e.target.value)}
                        className="w-full bg-gray-800 text-zinc-400 placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                    <button
                        onClick={createPath}
                        type="submit"
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition mb-4 mt-2"
                    >Publish path</button>

                </div>)}
                {activeTab != "Create" && (
                    <div className="flex flex-col">
                        {paths.filter(path => path.title.toLowerCase().includes(search.toLowerCase()))
                            .map(path => (
                                <div key={path.id} className="rounded-2xl bg-zinc-800 border border-purple-800 p-4 mb-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-white font-semibold">{path.title}</h2>
                                        <p className=" text-purple-400 font-semibold text-sm">€ {path.price}</p>
                                    </div>
                                    <p className="text-purple-400 font-semibold mb-3">{path.category}</p>
                                    <p className="text-zinc-400 text-sm mb-3">{path.description}</p>

                                </div>
                            ))}
                    </div>)}
            </div>
        </div>

    )

}

export default Paths