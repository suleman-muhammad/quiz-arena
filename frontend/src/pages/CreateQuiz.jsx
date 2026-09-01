import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CreateQuiz() {
    const navigate = useNavigate()
    
    // Left Card: Basic Info & Key Concepts
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('💻 CS & IT')
    const [keyConcepts, setKeyConcepts] = useState(['Speed & Accuracy', 'Battle Tactics', 'Arena Mastery'])
    const [newConcept, setNewConcept] = useState('')

    // Right Card: Custom Trivia & Arena Tips Ticker
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
                     category : categories.current.find(c => c.label === category) || categories[0]
                    }

        fetch('http://localhost:8080/api/quizzes', {
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
        fetch(`http://localhost:8080/api/quizzes/categories`)
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
        <div className="min-h-screen bg-[#070a18] text-white relative overflow-hidden flex flex-col justify-between py-10 px-4 sm:px-6 selection:bg-purple-500 selection:text-white font-sans">
            
            {/* Background Atmosphere */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 transform scale-105"
                style={{ backgroundImage: `url(${prepGalleryBg})` }}
            />
            {/* Cinematic Vignette & Ambient Glows */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070a18]/85 via-[#070a18]/65 to-[#070a18]/90 pointer-events-none" />
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full relative z-10 space-y-10">
                
                {/* Page Header */}
                <div className="text-center">
                    <span className="bg-purple-950/80 border border-purple-400/50 text-purple-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)] mb-2 inline-block">
                        ⚔️ ARENA FORGE
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
                        Create Battle Tournament
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
                        Customize what players see on the Waiting Room briefing & trivia cards, forge questions, and publish to the arena.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="max-w-2xl mx-auto bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold px-4 py-3 rounded-2xl text-center animate-fade-in shadow-lg">
                        ⚠️ {error}
                    </div>
                )}

                {/* ========================================================= */}
                {/* SECTION 1: WAITING ROOM LEFT CARD (Briefing & Concepts)    */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Card Input Form (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-900/90 border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 glow-purple backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <h2 className="text-base font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                                <span>📜</span> 1. Waiting Room Left Card: Quiz Briefing
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Left Side</span>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Tournament Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Master of Java & JVM Internals"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-950/90 border-2 border-slate-700 text-white rounded-2xl px-4 py-3 text-sm font-bold focus:border-purple-400 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Category & Topic */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Arena Discipline / Profession
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.label)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-1.5 cursor-pointer ${
                                                category === cat.label
                                                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-[1.02]'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                            }`}
                                        >
                                            <span className="shrink-0">{cat.icon}</span>
                                            <span className="truncate text-[11px]">{cat.label.replace(cat.icon, '').trim()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Description / Lore Summary
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. High-speed arena challenge testing core multithreading and memory principles."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-950/90 border-2 border-slate-700 text-white rounded-2xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Key Concepts Tested */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Key Concepts Tested (Left Card Bullets)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {keyConcepts.map((concept, idx) => (
                                        <span 
                                            key={idx} 
                                            className="bg-purple-950/90 border border-purple-400/60 text-purple-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
                                        >
                                            <span>{concept}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveConcept(idx)}
                                                className="text-purple-400 hover:text-rose-400 text-xs font-black cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add key concept (e.g. Memory Model, Deadlocks)..."
                                        value={newConcept}
                                        onChange={(e) => setNewConcept(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddConcept(e)}
                                        className="flex-1 bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:border-purple-400 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddConcept}
                                        className="bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exact Left Card Live Preview (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <span>👀</span> Live Left Card Preview (Waiting Room)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">1:1 Scale</span>
                        </div>

                        {/* TRUE STATE LEFT CARD AS IN WAITINGROOM.JSX */}
                        <div className="bg-slate-900/85 border-2 border-purple-500/80 rounded-2xl p-5 glow-purple backdrop-blur-md flex flex-col justify-between shadow-2xl">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-purple-900/60 border border-purple-400/50 text-purple-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                        {questions.length} Questions <span className="text-pink-400">✨</span>
                                    </span>
                                </div>

                                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex items-center justify-center p-3 relative overflow-hidden mb-4 group">
                                    <div className="absolute inset-0 bg-cyan-500/5 cyber-grid opacity-50" />
                                    <div className="text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10 transition-transform group-hover:scale-110 duration-300">
                                        {selectedCategoryObj?.icon || '💻'}
                                    </div>
                                </div>

                                <h3 className="text-xl font-extrabold text-white leading-tight">
                                    {title || 'Untitled Tournament'}
                                </h3>
                                <p className="text-xs text-purple-300/80 mt-1 mb-4">
                                    {description || 'Test your knowledge in the arena'}
                                </p>

                                <div className="border-t border-slate-800 pt-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key concepts</p>
                                    <ul className="text-xs text-slate-300 space-y-1.5">
                                        {keyConcepts.slice(0, 4).map((concept, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    idx % 4 === 0 ? 'bg-purple-400' :
                                                    idx % 4 === 1 ? 'bg-cyan-400' :
                                                    idx % 4 === 2 ? 'bg-pink-400' : 'bg-emerald-400'
                                                }`} />
                                                <span className="truncate">{concept}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* SECTION 2: WAITING ROOM RIGHT CARD (Trivia Ticker Only)    */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Right Card Input Form (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-900/90 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 glow-amber backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <h2 className="text-base font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                                <span>💡</span> 2. Waiting Room Right Card: Custom Trivia & Tips Ticker
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Right Side</span>
                        </div>

                        <div className="space-y-4">
                            {/* Custom Trivia Ticker Facts */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                                        Custom Trivia & Arena Tips Ticker
                                    </label>
                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                        {triviaFacts.length} Facts Added
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">
                                    Add interesting facts or battle tips that will rotate for gladiators on the right of the waiting room.
                                </p>
                                
                                {/* Scrollable List of Added Facts in Form */}
                                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1.5">
                                    {triviaFacts.map((fact, idx) => (
                                        <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-lg shrink-0">{fact.icon}</span>
                                                <div>
                                                    <h4 className="text-xs font-black text-purple-300">{fact.title}</h4>
                                                    <p className="text-xs text-slate-300 leading-snug">{fact.text}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFact(idx)}
                                                className="text-slate-500 hover:text-rose-400 text-xs font-black px-2 py-1 cursor-pointer shrink-0"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Fact Form */}
                                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                                    <div className="grid grid-cols-4 gap-2">
                                        <select
                                            value={newFactIcon}
                                            onChange={(e) => setNewFactIcon(e.target.value)}
                                            className="col-span-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs focus:outline-none"
                                        >
                                            <option value="💡">💡 Tip</option>
                                            <option value="⚔️">⚔️ Combat</option>
                                            <option value="📜">📜 Lore</option>
                                            <option value="🧠">🧠 Mind</option>
                                            <option value="⚡">⚡ Speed</option>
                                            <option value="🏆">🏆 Trophy</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Tip Title (e.g. Speed Tip)..."
                                            value={newFactTitle}
                                            onChange={(e) => setNewFactTitle(e.target.value)}
                                            className="col-span-3 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Tip description or interesting fun fact..."
                                            value={newFactText}
                                            onChange={(e) => setNewFactText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFact(e)}
                                            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFact}
                                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                                        >
                                            + Add Fact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exact Right Card Live Preview (5 cols) - FIXED HEIGHT & SCROLLABLE */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <span>👀</span> Live Trivia Ticker Preview (Waiting Room)
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">1:1 Scale • Scrollable</span>
                        </div>

                        {/* TRUE STATE TRIVIA TICKER CARD AS IN WAITINGROOM.JSX WITH FIXED HEIGHT */}
                        <div className="bg-slate-900/85 border-2 border-amber-500/80 rounded-2xl p-5 glow-amber backdrop-blur-md flex flex-col h-[415px] shadow-2xl">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2 shrink-0">
                                <span className="text-xs font-extrabold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                                    <span>💡</span> Trivia Ticker ({title ? title.slice(0, 18) : 'Arena'})
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {triviaFacts.length} Items
                                </span>
                            </div>

                            {/* Fixed Height Smooth Scrollable Container */}
                            <div className="space-y-3 overflow-y-auto flex-grow pr-1.5">
                                {triviaFacts.map((fact, idx) => (
                                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-3 hover:border-purple-500/40 transition-colors">
                                        <span className="text-lg shrink-0 mt-0.5">{fact.icon}</span>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-purple-300">{fact.title}</h4>
                                            <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{fact.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* SECTION 3: BATTLE QUESTIONS FORGE                         */}
                {/* ========================================================= */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h2 className="text-base sm:text-lg font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                            <span>⚔️</span> 3. Arena Battle Questions ({questions.length})
                        </h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer"
                        >
                            + Add Question
                        </button>
                    </div>

                    {questions.map((q, index) => (
                        <div key={index} className="bg-slate-900/90 border-2 border-slate-700/80 hover:border-purple-500/60 rounded-3xl p-6 shadow-xl backdrop-blur-md transition-all">
                            
                            {/* Question Card Header */}
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-purple-900/80 border border-purple-400/50 flex items-center justify-center font-black text-xs text-purple-200 shadow-sm">
                                        Q{index + 1}
                                    </span>
                                    <h3 className="text-sm font-black text-white">Battle Question #{index + 1}</h3>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Time Limit Selector */}
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

                                    {/* Remove button */}
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className="text-slate-500 hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer px-2 py-1"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Question Text Prompt */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter your question prompt (e.g. Which JVM memory area stores thread stack frames?)..."
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                                    className="w-full bg-slate-950/90 border-2 border-slate-700 text-white rounded-2xl px-4 py-3.5 text-sm font-bold focus:border-purple-400 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* 4 Options Grid (A, B, C, D) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { letter: 'A', border: 'border-rose-500/50 focus-within:border-rose-400', badge: 'bg-rose-500', optIndex: 0 },
                                    { letter: 'B', border: 'border-cyan-500/50 focus-within:border-cyan-400', badge: 'bg-cyan-500', optIndex: 1 },
                                    { letter: 'C', border: 'border-emerald-500/50 focus-within:border-emerald-400', badge: 'bg-emerald-500', optIndex: 2 },
                                    { letter: 'D', border: 'border-amber-500/50 focus-within:border-amber-400', badge: 'bg-amber-500', optIndex: 3 },
                                ].map(({ letter, border, badge, optIndex }) => {
                                    const isCorrect = q.correctOption === optIndex
                                    return (
                                        <div 
                                            key={letter}
                                            onClick={() => updateQuestion(index, 'correctOption', optIndex)}
                                            className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 bg-slate-950/80 transition-all cursor-pointer ${border} ${
                                                isCorrect ? 'ring-2 ring-emerald-400 bg-emerald-950/20' : ''
                                            }`}
                                        >
                                            {/* Correct Answer Radio Dot */}
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={isCorrect}
                                                onChange={() => updateQuestion(index, 'correctOption', optIndex)}
                                                className="accent-emerald-400 w-4 h-4 cursor-pointer ml-1"
                                            />

                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${badge}`}>
                                                {letter}
                                            </span>

                                            <input
                                                type="text"
                                                placeholder={`Option ${letter}`}
                                                value={q[`option${letter}`]}
                                                onChange={(e) => updateQuestion(index, `option${letter}`, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 bg-transparent text-white text-xs font-bold focus:outline-none placeholder-slate-600"
                                            />

                                            {isCorrect && (
                                                <span className="text-[10px] font-black text-emerald-400 mr-2 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md">
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

                {/* Actions Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full sm:w-auto border-2 border-slate-600 hover:border-purple-400 text-slate-200 hover:text-white px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all cursor-pointer"
                    >
                        + Add Another Question
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base tracking-wider transition-all shadow-[0_0_20px_rgba(234,179,8,0.35)] cursor-pointer flex items-center justify-center gap-2 ${
                            loading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'PUBLISHING TOURNAMENT...' : 'PUBLISH TOURNAMENT ⚔️'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateQuiz