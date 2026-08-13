import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CreateQuiz() {
    
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [questions, setQuestions] = useState([emptyQuestion()])

    function emptyQuestion() {
        return {
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 0,
            timeLimitSeconds: 10
        }
    }

    function updateQuestion(index, field, value) {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    function addQuestion() {
        setQuestions([...questions, emptyQuestion()])
    }

    function removeQuestion(index) {
        if (questions.length <= 1) return
        setQuestions(questions.filter((_, i) => i !== index))
    }

    function handleSubmit() {
        const quiz = { title, description, questions }
        fetch('http://localhost:8080/api/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quiz)
        })
            .then(res => res.json())
            .then(data => {
                console.log('Quiz created:', data)
                navigate('/')
            })
            .catch(err => console.error('Failed:', err))
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Create a Quiz</h1>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Quiz title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:border-rose-500 focus:outline-none"
                />
            </div>

            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Short description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:border-rose-500 focus:outline-none"
                />
            </div>

            {questions.map((q, index) => (
                <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Question {index + 1}</h3>
                        <button
                            onClick={() => removeQuestion(index)}
                            className="text-slate-500 hover:text-rose-400 text-sm transition"
                        >
                            Remove
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Question text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 mb-4 focus:border-rose-500 focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {['A', 'B', 'C', 'D'].map((letter, optIndex) => (
                            <div key={letter} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={q.correctOption === optIndex}
                                    onChange={() => updateQuestion(index, 'correctOption', optIndex)}
                                    className="accent-rose-500"
                                />
                                <input
                                    type="text"
                                    placeholder={`Option ${letter}`}
                                    value={q[`option${letter}`]}
                                    onChange={(e) => updateQuestion(index, `option${letter}`, e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Time limit:</span>
                        <select
                            value={q.timeLimitSeconds}
                            onChange={(e) => updateQuestion(index, 'timeLimitSeconds', parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                        >
                            <option value={5}>5 seconds</option>
                            <option value={10}>10 seconds</option>
                            <option value={15}>15 seconds</option>
                            <option value={20}>20 seconds</option>
                            <option value={30}>30 seconds</option>
                        </select>
                    </div>
                </div>
            ))}

            <div className="flex gap-4">
                <button
                    onClick={addQuestion}
                    className="border border-slate-600 text-slate-300 hover:border-rose-500 hover:text-rose-400 px-6 py-3 rounded-lg font-semibold transition"
                >
                    + Add Question
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                    Create Quiz
                </button>
            </div>
        </div>
    )
}

export default CreateQuiz