import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import QuizCard from '../components/QuizCard'

function Explore() {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/quizzes`)
            .then(res => {
                if (res.ok) return res.json()
            })
            .then(data => {
                setQuizzes(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('Unable to load quizzes from the Arena Game Server.')
                setLoading(false)
            })
    }, [])

    const categories = [
        { id: 'ALL', label: 'All Quizzes', icon: '🌐' },
        { id: 'cs_it', label: 'CS & IT', icon: '💻' },
        { id: 'science', label: 'Science', icon: '🔬' },
        { id: 'history', label: 'History', icon: '🏛️' },
        { id: 'gaming', label: 'Gaming', icon: '🎮' },
        { id: 'cinema', label: 'Pop Culture', icon: '🎬' },
        { id: 'nature', label: 'Nature', icon: '🌿' },
        { id: 'general', label: 'General', icon: '⚔️' },
    ]

    const filteredQuizzes = quizzes.filter(quiz => {
        const query = searchQuery.trim().toLowerCase()
        const matchesCategory = selectedCategory === 'ALL' || quiz.category?.id === selectedCategory
        const matchesSearch = query === '' ||
            quiz.title?.toLowerCase().includes(query) ||
            quiz.description?.toLowerCase().includes(query) ||
            quiz.concepts?.some(concept => concept.concept?.toLowerCase().includes(query))
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex flex-col">
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Explore All Quizzes</h1>
                        <p className="text-sm text-gray-400 mt-1">Search community challenges or filter by category.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search tournaments..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="w-full bg-[#111827] border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#F9FAFB] placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map(category => {
                                const active = selectedCategory === category.id
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={active
                                            ? 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-950/80 border border-blue-500/60 text-blue-200 shadow-sm shadow-blue-500/10 shrink-0 cursor-pointer'
                                            : 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f172a]/70 hover:bg-[#1e293b] border border-blue-900/40 text-blue-300 hover:text-blue-200 transition-all shrink-0 cursor-pointer'}
                                    >
                                        <span className="text-blue-400 text-xs shrink-0">{category.icon}</span>
                                        {category.label}
                                        <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800/50">
                                            {category.id === 'ALL' ? quizzes.length : quizzes.filter(quiz => quiz.category?.id === category.id).length}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <main className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
                    {loading && (
                        <div className="p-8 text-center text-sm text-gray-400">Loading quizzes...</div>
                    )}

                    {!loading && error && (
                        <div className="p-8 text-center text-sm text-gray-400">{error}</div>
                    )}

                    {!loading && !error && filteredQuizzes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {filteredQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                        </div>
                    )}

                    {!loading && !error && filteredQuizzes.length === 0 && (
                        <div className="p-8 text-center">
                            <h2 className="text-lg font-bold text-[#F9FAFB]">No quizzes found</h2>
                            <p className="text-sm text-gray-400 mt-1">Try another topic or create a new community quiz.</p>
                            <Link
                                to="/create"
                                className="mt-5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm inline-flex items-center justify-center gap-2"
                            >
                                Create Quiz
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Explore
