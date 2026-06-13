import { useState } from "react"
import api from "../api/client"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

function Login() {


    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const data = new URLSearchParams()
            data.append("username", email)
            data.append("password", password)
            const response = await api.post("/login", data)
            localStorage.setItem("token", response.data.access_token)
            try {
                await api.get("/dream_info")
                navigate("/Dashboard")
            } catch (err) {
                navigate("/Onboarding")
            }
        }
        catch (err) {
            setError("wrong email or password")
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6 relative overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600 rounded-full blur-3xl opacity-40"> </div>
            <form className="w-full max-w-sm mx-auto flex flex-col gap-5" onSubmit={handleSubmit}>
                <header>
                    <h1 className="text-3xl font-bold text-white"> Welcome back </h1>
                    <p className="text-sm text-gray-400 mt-1"> Pick up your streak where you left off. </p>
                </header>
                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300"> Email </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none
focus:ring-2 focus:ring-violet-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300"> Password </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (8+ chars)"
                            value={password}
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none
   focus:ring-2 focus:ring-violet-500 pr-12"
                            onChange={e => setPassword(e.target.value)}
                            minLength={8}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
                    </div>
                </div>
                <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition mt-2">Log in</button>
                <div className="flex gap-1 justify-center text-sm text-gray-400">
                    <p> Don't have an account?</p>
                    <Link to="/Register" className="text-violet-400 font-medium">Create account</Link>
                </div>
            </form>

        </div >

    )
}

export default Login