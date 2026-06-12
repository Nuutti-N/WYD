import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"

const DRAFTS_KEY = "wyd_path_drafts"
const LIST_TABS = ["All", "Popular", "New"]

function Paths() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [paths, setPaths] = useState([])
    const [activeTab, setActiveTab] = useState("All")
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [owned, setOwned] = useState([])
    const [success, setSuccess] = useState("")
    const [userCategory, setUserCategory] = useState("")
    const [drafts, setDrafts] = useState([])

    // load local drafts once
    useEffect(() => {
        const saved = localStorage.getItem(DRAFTS_KEY)
        if (saved) setDrafts(JSON.parse(saved))
    }, [])

    useEffect(() => {
        async function fetchSearch() {
            try {
                const response = await api.get(`/paths/search?q=${search}`)
                setSearchResults(response.data)

            }
            catch (err) {
            }
        }
        fetchSearch()
    }, [search])

    // load the user's dream category once (used to float their paths to the top)
    useEffect(() => {
        async function fetchCategory() {
            try {
                const response = await api.get("/dream_info")
                setUserCategory(response.data.category || "")
            } catch (err) {
                setUserCategory("")
            }
        }
        fetchCategory()
    }, [])

    async function fetchPaths() {
        setLoading(true)
        setError("")
        try {
            const endpoint = activeTab === "My paths" ? "/paths/mine" : "/paths"
            const response = await api.get(endpoint)
            setPaths(response.data)
        } catch (err) {
            setError("Couldn't load paths. Try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab !== "Create") fetchPaths()
    }, [activeTab])

    function saveDrafts(next) {
        setDrafts(next)
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(next))
    }

    function clearForm() {
        setTitle("")
        setDescription("")
        setCategory("")
        setPrice("")
    }

    function saveAsDraft() {
        const draft = { id: `draft-${Date.now()}`, title, description, category, price }
        saveDrafts([...drafts, draft])
        clearForm()
        setSuccess("Saved as draft.")
        setActiveTab("My paths")
    }

    async function createPath() {
        setError("")
        try {
            await api.post("/paths", { title, description, category, price })
            clearForm()
            setSuccess("Path published!")
            setActiveTab("All")
        } catch (err) {
            setError("Couldn't publish path. Check your fields and try again.")
        }
    }

    async function publishDraft(draft) {
        setError("")
        try {
            await api.post("/paths", {
                title: draft.title,
                description: draft.description,
                category: draft.category,
                price: draft.price,
            })
            saveDrafts(drafts.filter(d => d.id !== draft.id))
            setSuccess("Draft published!")
            fetchPaths()
        } catch (err) {
            setError("Couldn't publish draft. Try again.")
        }
    }

    function deleteDraft(id) {
        saveDrafts(drafts.filter(d => d.id !== id))
    }

    async function buyPath(id) {
        setError("")
        try {
            await api.post(`/paths/${id}/buy`)
            setOwned([...owned, id])
        } catch (err) {
            setError("Couldn't complete purchase. Try again.")
        }
    }

    // sort a list based on the active tab + the user's category
    function sortPaths(list) {
        const result = [...list]
        if (activeTab === "New") {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        if (userCategory && (activeTab === "All" || activeTab === "Popular")) {
            result.sort((a, b) => {
                const aMine = a.category?.toLowerCase() === userCategory.toLowerCase() ? 0 : 1
                const bMine = b.category?.toLowerCase() === userCategory.toLowerCase() ? 0 : 1
                return aMine - bMine
            })
        }
        return result
    }

    const visiblePaths = search ? searchResults : sortPaths(paths)

    const subtitle = {
        All: "Find a roadmap to reach your dream faster.",
        Popular: "Most loved paths (ranking coming soon).",
        New: "Freshly published roadmaps.",
        "My paths": "Your published paths and drafts.",
        Create: "Share a step-by-step roadmap others can follow.",
    }[activeTab]

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <div className="px-6 max-w-md mx-auto pt-20 flex flex-col flex-1 w-full">
                <h1 className="text-white font-bold text-2xl">
                    {activeTab === "Create" ? "Create a Path" : "Paths"}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>

                {activeTab !== "Create" && (
                    <div className="bg-zinc-800 rounded-xl px-4 py-3 mt-5 flex items-center gap-2">
                        <span className="text-zinc-500 text-sm">🔍</span>
                        <input
                            value={search}
                            placeholder="Search paths"
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-white w-full outline-none text-sm"
                        />
                    </div>
                )}

                <div className="flex gap-5 border-b border-zinc-800 mt-6 mb-5 overflow-x-auto whitespace-nowrap">
                    {[...LIST_TABS, "My paths", "Create"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-base shrink-0 ${activeTab === tab ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {success && (
                    <div className="bg-green-500/10 border border-green-600 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-600 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {activeTab === "Create" && (
                    <div className="flex flex-col gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <label className="text-sm font-medium text-gray-300">Title</label>
                        <input
                            value={title}
                            placeholder="e.g. 0 to junior dev in 6 months"
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <input
                            value={description}
                            placeholder="Tell people what they'll learn from your path..."
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                        <label className="text-sm font-medium text-gray-300">Category</label>
                        <input
                            value={category}
                            placeholder="Tech, Business, Fitness..."
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                        <label className="text-sm font-medium text-gray-300">Price €</label>
                        <input
                            value={price}
                            placeholder="19"
                            onChange={e => setPrice(e.target.value)}
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={saveAsDraft}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 rounded-xl transition"
                            >Save as draft</button>
                            <button
                                onClick={createPath}
                                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition"
                            >Publish path</button>
                        </div>
                    </div>
                )}

                {activeTab === "My paths" && (
                    <div className="flex flex-col">
                        {drafts
                            .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
                            .map(draft => (
                                <div key={draft.id} className="rounded-2xl bg-zinc-800 border border-zinc-700 p-4 mb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-white font-semibold text-base leading-snug">{draft.title || "Untitled"}</h2>
                                        <span className="shrink-0 bg-yellow-500/15 text-yellow-300 font-semibold text-xs px-3 py-1 rounded-full">Draft</span>
                                    </div>
                                    {draft.category && <span className="inline-block text-purple-400 text-xs font-medium uppercase tracking-wide mt-2">{draft.category}</span>}
                                    <p className="text-zinc-400 text-sm mt-2 mb-4">{draft.description}</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => deleteDraft(draft.id)}
                                            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2.5 rounded-xl transition">Delete</button>
                                        <button onClick={() => publishDraft(draft)}
                                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition">Publish</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {activeTab !== "Create" && (
                    <div className="flex flex-col">
                        {loading && (
                            <p className="text-zinc-500 text-center text-sm py-10">Loading…</p>
                        )}

                        {!loading && visiblePaths.length === 0 && drafts.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-zinc-400 text-sm">
                                    {activeTab === "My paths"
                                        ? "You don't have any paths yet."
                                        : search
                                            ? "No paths match your search."
                                            : "No paths yet. Be the first to create one!"}
                                </p>
                            </div>
                        )}

                        {!loading && visiblePaths.map(path => {
                            const isMine = userCategory && path.category?.toLowerCase() === userCategory.toLowerCase()
                            return (
                                <div key={path.id} className="rounded-2xl bg-zinc-800 border border-purple-800 p-4 mb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-white font-semibold text-base leading-snug">{path.title}</h2>
                                        <span className="shrink-0 bg-purple-500/15 text-purple-300 font-semibold text-sm px-3 py-1 rounded-full">€{path.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-block text-purple-400 text-xs font-medium uppercase tracking-wide">{path.category}</span>
                                        {isMine && activeTab !== "My paths" && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wide">Your category</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 text-sm mt-2 mb-4">{path.description}</p>
                                    {activeTab !== "My paths" && (
                                        <button onClick={() => buyPath(path.id)}
                                            disabled={owned.includes(path.id)}
                                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                                            {owned.includes(path.id) ? "Owned" : "Select"}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Paths
