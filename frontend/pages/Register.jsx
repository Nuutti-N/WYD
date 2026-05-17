import { useState } from "react"
import api from "../api/client"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

function Register() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const response = await api.post("/register", { email, password })
            navigate("/login")
        }
        catch (err) {
            setError("email or password invalid")
        }
    }

    return (
        <div className="">
            <form className="" onSubmit={handleSubmit}>
                <header className="">
                    <h1> Start your dream </h1>
                    <p> Go forward and find your dream </p>
                </header>
                <div className="">
                    <label htmlFor="email"> Email </label>
                </div>
                <input
                    id="email"
                    type="text"
                    placeholder="Email"
                    className=""
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <div className="">
                    <label htmlFor="password"> Password </label>
                </div>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (8+ chars)"
                    value={password}
                    className=""
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                />
                <button
                    type="button"
                    className=""
                    onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>

                <button type="submit" className="">Create account</button>
                <div className="">
                    <p> Already have an account?</p>
                    <Link to="/login" className="">Log in</Link>
                </div>
            </form>

        </div >

    )
}


export default Register