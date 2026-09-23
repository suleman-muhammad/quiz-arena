import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-[#F9FAFB] font-bold text-lg tracking-tight flex items-center gap-2">
                QuizArena
            </Link>
            <Link 
                to="/explore" 
                className="bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-sm"
            >
                Explore Quizzes
            </Link>
        </nav>
    )
}

export default Navbar


