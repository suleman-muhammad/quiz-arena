import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api';
import QuizCard from '../components/QuizCard'

function Home() {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
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

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex flex-col">
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#F9FAFB]">Featured Tournaments</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Top community challenges ready to play</p>
                    </div>
                    <Link
                        to="/explore"
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                    >
                        View All Quizzes &rarr;
                    </Link>
                </div>

                {/* Loading State - Cold Start Warning Screen */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-amber-500 animate-spin"></div>
                            <div className="w-14 h-14 rounded-full border-4 border-gray-800 border-b-gray-400 animate-spin absolute inset-3" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <span className="absolute inset-0 flex items-center justify-center text-xl">⚡</span>
                        </div>

                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2 tracking-wide">
                            Establishing Link to Arena Game Server...
                        </h3>

                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4">
                            Connecting to live cloud cluster ({elapsedSeconds}s). Cloud free-tier services may take ~30s to warm up if idle.
                        </p>

                        <div className="w-64 bg-[#0A0E1A] rounded-full h-1.5 overflow-hidden border border-gray-800">
                            <div className="bg-amber-500 h-full w-full animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* Error State with Retry Button */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#0A0E1A] border border-gray-800 flex items-center justify-center text-amber-400 text-2xl mb-4 shadow-sm">
                            ⚠️
                        </div>
                        <h4 className="text-xl font-bold text-[#F9FAFB] mb-2">Connection Timeout</h4>
                        <p className="text-sm text-gray-400 leading-normal max-w-md mb-6">{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            className="bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2"
                        >
                            <span>🔄</span>
                            <span>Reconnect to Arena</span>
                        </button>
                    </div>
                )}

                {/* Loaded Tournament Cards Grid */}
                {!loading && !error && quizzes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {quizzes.slice(0, 6).map(quiz => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}

                {/* No Matches Found */}
                {!loading && !error && quizzes.length === 0 && (
                    <div className="py-16 text-center text-gray-400">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="text-xl font-bold text-[#F9FAFB] mb-2">No tournaments match your filter</p>
                        <p className="text-sm text-gray-400 leading-normal mt-1">Try clearing your search query or selecting a different category</p>
                        <Link
                            to="/create"
                            className="bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 mt-4"
                        >
                            Create Quiz
                        </Link>
                    </div>
                )}

            </div>
            </div>
        </div>
    )
}

export default Home