import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
            <Link to="/" className="text-2xl font-bold text-neutral-400 hover:text-amber-300">
                QuizArena
            </Link>
            <Link 
                to="/explore" 
                className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
                Explore Quizzes
            </Link>
        </nav>
    )
}

export default Navbar


