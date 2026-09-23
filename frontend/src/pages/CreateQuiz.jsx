import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

function CreateQuiz() {
    const navigate = useNavigate()
    
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('💻 CS & IT')
    const [keyConcepts, setKeyConcepts] = useState(['Speed & Accuracy', 'Battle Tactics', 'Arena Mastery'])
    const [newConcept, setNewConcept] = useState('')

    const [triviaFacts, setTriviaFacts] = useState([
        { icon: '💡', title: 'Arena Tip', text: 'Faster correct answers earn maximum quadratic bonus points!' },
        { icon: '🛡️', title: 'Gladiator Rule', text: 'Wrong answers yield 0 points. Accuracy is just as crucial as speed.' }
    ])
    const [newFactTitle, setNewFactTitle] = useState('')
    const [newFactText, setNewFactText] = useState('')
    const [newFactIcon, setNewFactIcon] = useState('💡')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [questions, setQuestions] = useState([emptyQuestion()])

    function emptyQuestion() {
        return {
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 0,
            timeLimitSeconds: 15
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

    function handleAddConcept(e) {
        e?.preventDefault()
        if (!newConcept.trim()) return
        if (keyConcepts.length >= 5) {
            setError("Maximum 5 key concepts allowed.")
            return
        }
        setKeyConcepts([...keyConcepts, newConcept.trim()])
        setNewConcept('')
        setError('')
    }

    function handleRemoveConcept(index) {
        setKeyConcepts(keyConcepts.filter((_, i) => i !== index))
    }

    function handleAddFact(e) {
        e?.preventDefault()
        if (!newFactTitle.trim() || !newFactText.trim()) {
            setError("Trivia fact requires both a title and description.")
            return
        }
        if (triviaFacts.length >= 25) {
            setError("Maximum 25 trivia facts allowed.")
            return
        }
        setTriviaFacts([...triviaFacts, {
            icon: newFactIcon || '💡',
            title: newFactTitle.trim(),
            text: newFactText.trim()
        }])
        setNewFactTitle('')
        setNewFactText('')
        setError('')
    }

    function handleRemoveFact(index) {
        setTriviaFacts(triviaFacts.filter((_, i) => i !== index))
    }

    function handleSubmit() {
        if (!title.trim()) {
            setError("Tournament title cannot be empty.")
            return
        }
        if (questions.some(q => !q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim())) {
            setError("All questions must have question text and at least options A & B filled.")
            return
        }

        setError('')
        setLoading(true)

        const quiz = { title: title.trim(),
                     description: description.trim(),
                     questions: questions,
                     triviaFacts: triviaFacts,
                     concepts: keyConcepts.map(c => ({concept:c})),
                     category : categories.find(c => c.label === category) || categories[0]
                    }

        fetch(`${API_BASE_URL}/api/quizzes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quiz)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save quiz.")
                return res.json()
            })
            .then(data => {
                console.log('Quiz created:', data)
                setLoading(false)
                navigate('/')
            })
            .catch(err => {
                console.error('Failed:', err)
                setLoading(false)
                setError("Failed to create tournament. Is the backend server running?")
            })
    }

    const defaultCategories = [
        { id: 'cs_it', label: '💻 CS & IT', icon: '💻' },
        { id: 'psychology', label: '🧠 Psychology', icon: '🧠' },
        { id: 'history', label: '🏛️ World History', icon: '🏛️' },
        { id: 'medicine', label: '🩺 Medicine & Health', icon: '🩺' },
        { id: 'business', label: '💼 Business & Finance', icon: '💼' },
        { id: 'law', label: '⚖️ Law & Judiciary', icon: '⚖️' },
        { id: 'science', label: '🔬 Science & Physics', icon: '🔬' },
        { id: 'engineering', label: '📐 Math & Engineering', icon: '📐' },
        { id: 'art', label: '🎨 Art & Architecture', icon: '🎨' },
        { id: 'geography', label: '🌍 Geography & Earth', icon: '🌍' },
        { id: 'literature', label: '📚 Literature & Philosophy', icon: '📚' },
        { id: 'cinema', label: '🎬 Cinema & Pop Culture', icon: '🎬' },
        { id: 'sports', label: '⚽ Sports & Athletics', icon: '⚽' },
        { id: 'general', label: '⚔️ General Arena', icon: '⚔️' }
    ]



    const [categories, setCategories] = useState(defaultCategories)

    useEffect(() =>{
        fetch(`${API_BASE_URL}/api/quiz-categories`)
            .then((res) => {
                if(!res.ok) return null
                return res.json()
            })
            .then((data) =>{
                if(data && Array.isArray(data) && data.length > 0){
                    console.log(data)
                    setCategories(data);
                }
            })
            .catch(err => console.log('Failed to Load categories:',err))
    },[])

    const selectedCategoryObj = categories.find(c => c.label === category) || categories[0]

    return (
        <div className="min-h-screen w-full bg-[#0A0E1A] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-bold text-[#F9FAFB]">Create Tournament</h1>
                <p className="text-sm text-gray-400 mt-1">Set up tournament details, lobby briefing notes, and battle questions.</p>
            </header>

            {error && <div className="bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold px-4 py-3 rounded-xl text-center">⚠️ {error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <aside className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">LIVE LOBBY PREVIEW</span>
                    <div className="bg-[#0A0E1A] border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-800 text-sky-400 border border-gray-700/60">{questions.length} Questions</span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-800 text-amber-400 border border-gray-700/60">{selectedCategoryObj?.label || 'General Arena'}</span>
                        </div>
                        <div className="h-32 rounded-xl bg-[#111827] border border-gray-800 flex items-center justify-center text-5xl">{selectedCategoryObj?.icon || '💻'}</div>
                        <div>
                            <h2 className="text-xl font-bold text-[#F9FAFB]">{title || 'Untitled Tournament'}</h2>
                            <p className="text-sm text-gray-400 mt-1">{description || 'Test your knowledge in the arena'}</p>
                        </div>
                        <div className="border-t border-gray-800 pt-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Key concepts</p>
                            <ul className="text-sm text-gray-300 space-y-1.5">
                                {keyConcepts.slice(0, 4).map((concept, idx) => <li key={idx} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="truncate">{concept}</span></li>)}
                            </ul>
                        </div>
                    </div>
                </aside>

                <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">TOURNAMENT INFO</span>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Tournament Title *</label>
                        <input type="text" placeholder="e.g. Master of Java & JVM Internals" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0A0E1A] border border-gray-800 text-sm rounded-xl p-2.5 text-[#F9FAFB] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Category</label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {categories.map(cat => <button key={cat.id} type="button" onClick={() => setCategory(cat.label)} className={`px-3 py-1.5 rounded-lg text-xs border ${category === cat.label ? 'bg-amber-500 text-gray-950 font-bold border-amber-400' : 'bg-[#0A0E1A] border-gray-800 text-gray-400 hover:text-white'}`}><span>{cat.icon}</span> {cat.label.replace(cat.icon, '').trim()}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Description</label>
                        <input type="text" placeholder="Describe the tournament..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0A0E1A] border border-gray-800 text-sm rounded-xl p-2.5 text-[#F9FAFB] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Key Concepts</label>
                        <div className="flex flex-wrap gap-2 mb-2">{keyConcepts.map((concept, idx) => <span key={idx} className="bg-gray-800 border border-gray-700/60 text-amber-400 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">{concept}<button type="button" onClick={() => handleRemoveConcept(idx)} className="text-gray-400 hover:text-rose-400">✕</button></span>)}</div>
                        <div className="flex gap-2"><input type="text" placeholder="Add key concept..." value={newConcept} onChange={(e) => setNewConcept(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddConcept(e)} className="flex-1 bg-[#0A0E1A] border border-gray-800 text-sm rounded-xl p-2.5 text-[#F9FAFB] focus:border-amber-500 outline-none" /><button type="button" onClick={handleAddConcept} className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold px-4 rounded-xl">+ Add</button></div>
                    </div>
                </section>

                <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">WAITING ROOM TRIVIA & TIPS</span>
                    <div className="flex gap-2"><select value={newFactIcon} onChange={(e) => setNewFactIcon(e.target.value)} className="w-24 bg-[#0A0E1A] border border-gray-800 text-[#F9FAFB] rounded-xl px-2 py-2 text-sm"><option value="💡">💡 Tip</option><option value="⚔️">⚔️ Combat</option><option value="📜">📜 Lore</option><option value="🧠">🧠 Mind</option><option value="⚡">⚡ Speed</option><option value="🏆">🏆 Trophy</option></select><input type="text" placeholder="Tip title" value={newFactTitle} onChange={(e) => setNewFactTitle(e.target.value)} className="flex-1 bg-[#0A0E1A] border border-gray-800 text-sm rounded-xl px-3 py-2 text-[#F9FAFB] focus:border-amber-500 outline-none" /></div>
                    <input type="text" placeholder="Tip description..." value={newFactText} onChange={(e) => setNewFactText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFact(e)} className="w-full bg-[#0A0E1A] border border-gray-800 text-sm rounded-xl px-3 py-2 text-[#F9FAFB] focus:border-amber-500 outline-none" />
                    <button type="button" onClick={handleAddFact} className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-4 py-2 rounded-xl">+ Add Fact</button>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">{triviaFacts.map((fact, idx) => <div key={idx} className="bg-[#0A0E1A] border border-gray-800 rounded-xl p-3 flex items-start justify-between gap-2"><div><h4 className="text-sm font-bold text-[#F9FAFB]">{fact.icon} {fact.title}</h4><p className="text-xs text-gray-400 mt-1">{fact.text}</p></div><button type="button" onClick={() => handleRemoveFact(idx)} className="text-gray-400 hover:text-rose-400">✕</button></div>)}</div>
                </section>
            </div>

            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl w-full">
                <div className="flex items-center justify-between gap-4"><div><span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">QUESTION BUILDER</span><h2 className="text-lg font-bold text-[#F9FAFB] mt-1">Arena Battle Questions ({questions.length})</h2></div><button type="button" onClick={addQuestion} className="border border-dashed border-gray-700 bg-transparent text-gray-300 hover:text-white rounded-xl py-3 px-4 text-sm font-semibold">+ Add Question</button></div>
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={index} className="bg-[#0A0E1A] border border-gray-800 rounded-xl p-5 space-y-4 transition-all">
                            
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-amber-400 font-mono text-sm font-bold flex items-center gap-2">
                                        Q{index + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-[#F9FAFB]">Battle Question #{index + 1}</h3>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1">
                                        <span className="text-[10px] font-bold text-slate-400">⏱️ Limit:</span>
                                        <select
                                            value={q.timeLimitSeconds}
                                            onChange={(e) => updateQuestion(index, 'timeLimitSeconds', parseInt(e.target.value))}
                                            className="bg-transparent text-amber-400 font-black text-xs focus:outline-none cursor-pointer"
                                        >
                                            <option value={5} className="bg-slate-900 text-white">5s</option>
                                            <option value={10} className="bg-slate-900 text-white">10s</option>
                                            <option value={15} className="bg-slate-900 text-white">15s</option>
                                            <option value={20} className="bg-slate-900 text-white">20s</option>
                                            <option value={30} className="bg-slate-900 text-white">30s</option>
                                        </select>
                                    </div>

                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className="text-gray-400 hover:text-rose-400 text-xs font-medium px-2 py-1 rounded transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter your question prompt (e.g. Which JVM memory area stores thread stack frames?)..."
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                                    className="w-full bg-[#0A0E1A] border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#F9FAFB] placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { letter: 'A', border: 'border-rose-500/50 focus-within:border-rose-400', badge: 'bg-rose-500', optIndex: 0 },
                                    { letter: 'B', border: 'border-cyan-500/50 focus-within:border-cyan-400', badge: 'bg-cyan-500', optIndex: 1 },
                                    { letter: 'C', border: 'border-emerald-500/50 focus-within:border-emerald-400', badge: 'bg-emerald-500', optIndex: 2 },
                                    { letter: 'D', border: 'border-amber-500/50 focus-within:border-amber-400', badge: 'bg-amber-500', optIndex: 3 },
                                ].map(({ letter, border, optIndex }) => {
                                    const isCorrect = q.correctOption === optIndex
                                    return (
                                        <div 
                                            key={letter}
                                            onClick={() => updateQuestion(index, 'correctOption', optIndex)}
                                            className={`flex items-center gap-2.5 bg-[#111827] border border-gray-800 rounded-xl px-3 py-2 focus-within:border-gray-700 transition-all cursor-pointer ${border} ${
                                                isCorrect ? 'ring-1 ring-amber-500 bg-amber-950/20' : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={isCorrect}
                                                onChange={() => updateQuestion(index, 'correctOption', optIndex)}
                                                className="accent-amber-500 w-4 h-4 cursor-pointer ml-1"
                                            />

                                            <span className="w-6 h-6 rounded-md bg-gray-800 text-gray-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                                {letter}
                                            </span>

                                            <input
                                                type="text"
                                                placeholder={`Option ${letter}`}
                                                value={q[`option${letter}`]}
                                                onChange={(e) => updateQuestion(index, `option${letter}`, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-transparent text-sm text-[#F9FAFB] placeholder:text-gray-500 w-full outline-none"
                                            />

                                            {isCorrect && (
                                                <span className="text-[10px] font-semibold text-amber-400 mr-2 bg-gray-800 border border-gray-700/60 px-2 py-0.5 rounded-md">
                                                    CORRECT ✔
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-3 border border-dashed border-gray-700 hover:border-amber-500/60 bg-[#0A0E1A] hover:bg-[#0f1422] text-gray-300 hover:text-amber-400 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        + Add Another Question
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-bold px-8 py-3 rounded-xl transition-all shadow-md text-sm inline-flex items-center justify-center gap-2 ${
                            loading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : ''
                        }`}
                    >
                        {loading ? 'PUBLISHING TOURNAMENT...' : 'PUBLISH TOURNAMENT ⚔️'}
                    </button>
                </div>
                </section>
            </div>
    )
}

export default CreateQuiz