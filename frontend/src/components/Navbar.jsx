import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-transparent border-b border-purple-900/30">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                QuizArena
            </Link>
            <Link 
                to="/explore" 
                className="border-2 border-yellow-500 text-yellow-500 bg-transparent hover:bg-yellow-500/10 px-5 py-2 rounded-lg font-bold transition-all"
            >
                Explore Quizzes
            </Link>
        </nav>
    )
}

export default Navbar


