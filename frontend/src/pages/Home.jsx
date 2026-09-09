import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api';
import QuizCard from '../components/QuizCard'

function Home() {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    function fetchQuizzes() {
        setLoading(true)
        setError(null)
        setElapsedSeconds(0)

        fetch(`${API_BASE_URL}/api/quizzes`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then(data => {
                setQuizzes(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError("Unable to connect to Arena Game Server. The cloud instance might be starting up.")
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchQuizzes()
    }, [])

    useEffect(() => {
        let timer
        if (loading) {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [loading])

    const categories = [
        { id: 'ALL', label: 'All Tournaments', icon: '🌐' },
        { id: 'cs_it', label: 'CS & IT', icon: '💻' },
        { id: 'science', label: 'Science & Physics', icon: '🔬' },
        { id: 'history', label: 'World History', icon: '🏛️' },
        { id: 'gaming', label: 'Gaming & Esports', icon: '🎮' },
        { id: 'cinema', label: 'Cinema & Pop', icon: '🎬' },
        { id: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
        { id: 'general', label: 'General Arena', icon: '⚔️' },
    ]

    const filteredQuizzes = quizzes.filter(q => {
        const matchesCategory = selectedCategory === 'ALL' || q.category?.id === selectedCategory
        const matchesSearch = searchQuery.trim() === '' ||
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.concepts?.some(c => c.concept?.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/create"
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500 text-purple-300 hover:text-white hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Quiz
                        </Link>
                        
                        <Link
                            to="/join"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500 text-blue-300 hover:text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                            Join Quiz
                        </Link>
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search 50+ tournaments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/90 border border-purple-500/30 rounded-xl px-4 py-2 pl-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-purple-500/20">
                    {categories.map(cat => {
                        const count = cat.id === 'ALL'
                            ? quizzes.length
                            : quizzes.filter(q => q.category?.id === cat.id).length

                        const isSelected = selectedCategory === cat.id

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                    isSelected
                                        ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                                        : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:border-slate-700 hover:text-gray-200'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                {count > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-purple-500 text-slate-950 font-black' : 'bg-slate-800 text-gray-400'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Loading State - Cold Start Warning Screen */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                            <div className="w-14 h-14 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin absolute inset-3" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <span className="absolute inset-0 flex items-center justify-center text-xl">⚡</span>
                        </div>

                        <h3 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-wide">
                            Establishing Link to Arena Game Server...
                        </h3>

                        <p className="text-gray-400 text-sm max-w-md mb-4">
                            Connecting to live cloud cluster ({elapsedSeconds}s). Cloud free-tier services may take ~30s to warm up if idle.
                        </p>

                        <div className="w-64 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-purple-500/30">
                            <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-full animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* Error State with Retry Button */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 text-2xl mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            ⚠️
                        </div>
                        <h4 className="text-lg font-bold text-gray-200 mb-2">Connection Timeout</h4>
                        <p className="text-gray-400 text-sm max-w-md mb-6">{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                        >
                            <span>🔄</span>
                            <span>Reconnect to Arena</span>
                        </button>
                    </div>
                )}

                {/* Loaded Tournament Cards Grid */}
                {!loading && !error && filteredQuizzes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map(quiz => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}

                {/* No Matches Found */}
                {!loading && !error && filteredQuizzes.length === 0 && (
                    <div className="py-16 text-center text-gray-400">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="font-semibold text-gray-300">No tournaments match your filter</p>
                        <p className="text-xs text-gray-500 mt-1">Try clearing your search query or selecting a different category</p>
                        <button
                            onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                            className="mt-4 px-4 py-1.5 rounded-lg bg-purple-900/30 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50 transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Home