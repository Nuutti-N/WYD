import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"

const DRAFTS_KEY = "wyd_path_drafts"
const LIST_TABS = ["All", "Popular", "New"]
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]
const EMPTY_STEP = { title: "", why: "", instructions: "", deliverable: "", hours: "", tips: "" }

function Paths() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [paths, setPaths] = useState([])
    const [activeTab, setActiveTab] = useState("All")
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [owned, setOwned] = useState([])
    const [success, setSuccess] = useState("")
    const [userCategory, setUserCategory] = useState("")
    const [drafts, setDrafts] = useState([])

    // ---- create-form state (one long page) ----
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [difficulty, setDifficulty] = useState("Beginner")
    const [achievements, setAchievements] = useState([""])
    const [prerequisites, setPrerequisites] = useState([""])
    const [steps, setSteps] = useState([{ ...EMPTY_STEP }])

    // load local drafts once
    useEffect(() => {
        const saved = localStorage.getItem(DRAFTS_KEY)
        if (saved) setDrafts(JSON.parse(saved))
    }, [])

    // load which paths the user already unlocked (so "Enrolled" survives reload)
    useEffect(() => {
        async function fetchOwned() {
            try {
                const response = await api.get("/paths/owned")
                setOwned(response.data || [])
            } catch (err) {
                setOwned([])
            }
        }
        fetchOwned()
    }, [])

    useEffect(() => {
        async function fetchSearch() {
            try {
                const response = await api.get(`/paths/search?q=${search}`)
                setSearchResults(response.data)
            } catch (err) {
            }
        }
        if (search) fetchSearch()
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
        setDifficulty("Beginner")
        setAchievements([""])
        setPrerequisites([""])
        setSteps([{ ...EMPTY_STEP }])
    }

    // ---- small list editors (achievements + prerequisites) ----
    function updateListItem(list, setList, i, value) {
        setList(list.map((item, idx) => (idx === i ? value : item)))
    }
    function addListItem(list, setList) {
        setList([...list, ""])
    }
    function removeListItem(list, setList, i) {
        setList(list.filter((_, idx) => idx !== i))
    }

    // ---- steps editor ----
    function updateStep(i, field, value) {
        setSteps(steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
    }
    function addStep() {
        setSteps([...steps, { ...EMPTY_STEP }])
    }
    function removeStep(i) {
        setSteps(steps.filter((_, idx) => idx !== i))
    }

    // build the payload the backend expects (drops blank list items)
    function buildPayload() {
        return {
            title,
            description,
            category,
            price: parseFloat(price) || 0,
            difficulty,
            achievements: achievements.map(a => a.trim()).filter(Boolean),
            prerequisites: prerequisites.map(p => p.trim()).filter(Boolean),
            steps: steps
                .filter(s => s.title.trim())
                .map(s => ({
                    title: s.title,
                    why: s.why,
                    instructions: s.instructions,
                    deliverable: s.deliverable,
                    hours: parseFloat(s.hours) || 0,
                    tips: s.tips,
                })),
        }
    }

    function saveAsDraft() {
        const draft = { id: `draft-${Date.now()}`, ...buildPayload() }
        saveDrafts([...drafts, draft])
        clearForm()
        setSuccess("Saved as draft.")
        setActiveTab("My paths")
    }

    async function createPath() {
        setError("")
        try {
            await api.post("/paths", buildPayload())
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
            const { id, ...payload } = draft
            await api.post("/paths", payload)
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

    // sort a list based on the active tab + the user's category
    function sortPaths(list) {
        const result = [...list]
        if (activeTab === "New") {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        if (activeTab === "Popular") {
            result.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0))
        }
        if (userCategory && activeTab === "All") {
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
        Popular: "Most enrolled paths.",
        New: "Freshly published roadmaps.",
        "My paths": "Your published paths and drafts.",
        Create: "Share a step-by-step roadmap others can follow.",
    }[activeTab]

    const inputClass = "w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"

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

                {/* ---------- CREATE: one long builder page ---------- */}
                {activeTab === "Create" && (
                    <div className="flex flex-col gap-6 pb-10">
                        {/* basics */}
                        <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                            <label className="text-sm font-medium text-gray-300">Title</label>
                            <input value={title} placeholder="e.g. 0 to junior dev in 6 months"
                                onChange={e => setTitle(e.target.value)} className={inputClass} />
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <input value={description} placeholder="What people will achieve from your path..."
                                onChange={e => setDescription(e.target.value)} className={inputClass} />
                            <label className="text-sm font-medium text-gray-300">Category</label>
                            <input value={category} placeholder="Tech, Business, Fitness..."
                                onChange={e => setCategory(e.target.value)} className={inputClass} />
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-300">Difficulty</label>
                                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                                        className={inputClass + " mt-1"}>
                                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="text-sm font-medium text-gray-300">Price €</label>
                                    <input value={price} placeholder="0" inputMode="decimal"
                                        onChange={e => setPrice(e.target.value)} className={inputClass + " mt-1"} />
                                </div>
                            </div>
                        </div>

                        {/* what you'll achieve */}
                        <div className="flex flex-col gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                            <h3 className="text-white font-semibold">What you'll achieve</h3>
                            <p className="text-zinc-500 text-xs mb-1">The wins someone gets by finishing.</p>
                            {achievements.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={item} placeholder="A working SaaS with paying users"
                                        onChange={e => updateListItem(achievements, setAchievements, i, e.target.value)}
                                        className={inputClass} />
                                    <button onClick={() => removeListItem(achievements, setAchievements, i)}
                                        className="px-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">✕</button>
                                </div>
                            ))}
                            <button onClick={() => addListItem(achievements, setAchievements)}
                                className="text-violet-400 text-sm text-left mt-1">+ add achievement</button>
                        </div>

                        {/* prerequisites */}
                        <div className="flex flex-col gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                            <h3 className="text-white font-semibold">Prerequisites</h3>
                            <p className="text-zinc-500 text-xs mb-1">What people should have before starting.</p>
                            {prerequisites.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={item} placeholder="Basic computer skills"
                                        onChange={e => updateListItem(prerequisites, setPrerequisites, i, e.target.value)}
                                        className={inputClass} />
                                    <button onClick={() => removeListItem(prerequisites, setPrerequisites, i)}
                                        className="px-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">✕</button>
                                </div>
                            ))}
                            <button onClick={() => addListItem(prerequisites, setPrerequisites)}
                                className="text-violet-400 text-sm text-left mt-1">+ add prerequisite</button>
                        </div>

                        {/* roadmap steps */}
                        <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                            <h3 className="text-white font-semibold">Roadmap steps</h3>
                            <p className="text-zinc-500 text-xs">Each step: what to do, why it matters, what they'll have after.</p>
                            {steps.map((step, i) => (
                                <div key={i} className="border border-zinc-700 rounded-xl p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-violet-400 text-xs font-semibold">Step {i + 1}</span>
                                        <button onClick={() => removeStep(i)} className="text-zinc-500 hover:text-white text-sm">✕</button>
                                    </div>
                                    <input value={step.title} placeholder="Step title"
                                        onChange={e => updateStep(i, "title", e.target.value)} className={inputClass} />
                                    <input value={step.why} placeholder="Why this step matters"
                                        onChange={e => updateStep(i, "why", e.target.value)} className={inputClass} />
                                    <textarea value={step.instructions} placeholder="Exactly how to do it..."
                                        onChange={e => updateStep(i, "instructions", e.target.value)} rows={3} className={inputClass} />
                                    <input value={step.deliverable} placeholder="What you'll have when done"
                                        onChange={e => updateStep(i, "deliverable", e.target.value)} className={inputClass} />
                                    <div className="flex gap-2">
                                        <input value={step.hours} placeholder="Hours" inputMode="decimal"
                                            onChange={e => updateStep(i, "hours", e.target.value)} className={inputClass + " w-28"} />
                                        <input value={step.tips} placeholder="Pro tips / resources"
                                            onChange={e => updateStep(i, "tips", e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            ))}
                            <button onClick={addStep} className="text-violet-400 text-sm text-left">+ add step</button>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={saveAsDraft}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 rounded-xl transition">Save as draft</button>
                            <button onClick={createPath}
                                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition">Publish path</button>
                        </div>
                    </div>
                )}

                {/* ---------- MY PATHS: drafts ---------- */}
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

                {/* ---------- LISTS: rich clickable cards ---------- */}
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
                            const isOwned = owned.includes(path.id)
                            return (
                                <div key={path.id}
                                    onClick={() => navigate(`/Path/${path.id}`)}
                                    className="rounded-2xl bg-zinc-800 border border-purple-800 p-4 mb-3 cursor-pointer hover:border-purple-600 transition">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-white font-semibold text-base leading-snug">{path.title}</h2>
                                        <span className="shrink-0 bg-purple-500/15 text-purple-300 font-semibold text-sm px-3 py-1 rounded-full">
                                            {path.price > 0 ? `€${path.price}` : "Free"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="inline-block text-purple-400 text-xs font-medium uppercase tracking-wide">{path.category}</span>
                                        {path.difficulty && (
                                            <span className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{path.difficulty}</span>
                                        )}
                                        {isMine && activeTab !== "My paths" && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wide">Your category</span>
                                        )}
                                        {isOwned && (
                                            <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full uppercase tracking-wide">Enrolled</span>
                                        )}
                                    </div>

                                    {path.achievements?.length > 0 && (
                                        <p className="text-green-400 text-sm mt-2">✓ You will achieve: {path.achievements[0]}</p>
                                    )}

                                    <p className="text-zinc-400 text-sm mt-2 mb-3 line-clamp-2">{path.description}</p>

                                    {/* mentor proof */}
                                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                                        <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">Mentor</span>
                                        <span className="text-zinc-300">{path.mentor_name}</span>
                                        <span>🔥 {path.mentor_streak || 0}</span>
                                        <span>⏱ {path.mentor_hours || 0}h</span>
                                    </div>

                                    {/* footer stats */}
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 border-t border-zinc-700 pt-3">
                                        {path.total_hours ? <span>⏱ {path.total_hours}h</span> : null}
                                        <span>👥 {path.enrolled || 0} enrolled</span>
                                    </div>
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
