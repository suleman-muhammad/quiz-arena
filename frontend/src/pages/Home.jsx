import { useState, useEffect} from 'react'
import { Link } from  'react-router-dom'
import { API_BASE_URL } from '../config/api';
import QuizCard from '../components/QuizCard'

function Home() {
    const [quizzes, setQuizzes] = useState([])

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/quizzes`)
            .then(res => res.json())
            .then(data => setQuizzes(data))
            .catch(err => console.error(err))
    }, [])

    return (
        
        <div className="p-8 max-w-7xl mx-auto">
            <div className="bg-slate-900 border border-purple-500 rounded-2xl p-6 shadow-2xl">
                
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="./create"
                        className="flex items-center gap-2 bg-slate-950 border border-purple-500 text-purple-400 hover:bg-purple-900/30 px-5 py-2.5 rounded-lg font-bold transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create Quiz
                    </Link>
                    
                    <Link
                        to="./join"
                        className="flex items-center gap-2 bg-slate-950 border border-blue-500 text-blue-400 hover:bg-blue-900/30 px-5 py-2.5 rounded-lg font-bold transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                        Join Quiz
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>
                
            </div>
        </div>
    )
}

export default Home