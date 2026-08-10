import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [quizzes, setQuizzes] = useState([])
  useEffect(() => {
        fetch('http://localhost:8080/api/quizzes')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setQuizzes(data);
            })
            .catch(err => console.error('Fetch failed:', err));
    }, []);   // empty array = run once on mount
  return (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">QuizArena</h1>
        <h2 className="text-xl mb-2">Available Quizzes:</h2>
        {quizzes.map(quiz => (
            <div key={quiz.id} className="p-4 mb-2 border rounded">
                <h3 className="font-bold">{quiz.title}</h3>
                <p>{quiz.description}</p>
            </div>
        ))}
    </div>
  )
}

export default App
