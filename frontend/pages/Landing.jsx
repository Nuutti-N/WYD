import { Link } from 'react-router-dom'

function Landing() {

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-950 px-6 relative overflow-hidden text-center pb-48">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600 rounded-full blur-3xl opacity-60" />
            <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
                <header className=" text-4xl text-white font-bold flex flex-col"> WYD</header>
                <header className="flex flex-col gap-5">
                    <h1 className="text-4xl font-semibold text-white leading-tight">Find your direction</h1>
                    <p className="text-lg font-semibold text-violet-300 gap-10">Try different paths, find what drives you and never look back.</p>
                </header>

                <div className="flex flex-col gap-3 mt-8 text-center">
                    <Link to="/Register" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-2xl transition">Get started</Link>
                    <div className="flex gap-1 justify-center text-sm text-gray-400">
                        <p> Already have an account?</p>
                        <Link to="/Login" className="text-violet-400 font-medium">Log in</Link>
                    </div>

                </div>


            </div>
        </div >

    )
}


export default Landing