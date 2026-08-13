import { useState, useEffect} from 'react'
import { Link } from  'react-router-dom'
import QuizCard from '../components/QuizCard'

function Home() {
    const [quizzes, setQuizzes] = useState([])

    useEffect(() => {
        fetch('http://localhost:8080/api/quizzes')
            .then(res => res.json())
            .then(data => setQuizzes(data))
            .catch(err => console.error(err))
    }, [])

    return (
        
        <div className="p-8">
            <Link
                to="./create"
                className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white px-4 py-2 rounded-lg font-semibold transition"
    
            >
                Create Quiz
            </Link>
            <Link
                to="./join"
                className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white px-4 py-2 rounded-lg font-semibold transition"
    
            >
                Join Quiz
            </Link>
            {quizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
            ))}
        </div>
    )
}

export default Home