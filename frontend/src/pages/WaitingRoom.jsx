import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'
import { HostAvatar, PlayerAvatar } from "../components/CyberAvatar"

function WaitingRoom() {
    const navigate = useNavigate()
    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname') || 'Player'
    const isHost = searchParams.get('host') === 'true'
    const isHostPlaying = searchParams.get('playing') === 'true'

    const [connected, setConnected] = useState(false)
    const [copied, setCopied] = useState(false)
    const [players, setPlayers] = useState([])
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)
    const [quizQuestions, setQuizQuestions] = useState([])

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { sender: 'Arena Master', text: 'Welcome champions to the QuizArena battle lobby!', isSystem: true }
    ])
    const [chatInput, setChatInput] = useState('')
    const [chatMinimized, setChatMinimized] = useState(false)

    // Dynamic Trivia & Lore Generator based on Quiz Title & Topic
    function getDynamicTrivia(title = "", questions = []) {
        const safeTitle = typeof title === 'string' ? title : ""
        const safeQuestions = Array.isArray(questions) ? questions : []
        const lower = safeTitle.toLowerCase()
        const facts = []

        if (lower.includes('java') && !lower.includes('javascript')) {
            facts.push(
                { title: "Java Fact", icon: "☕", text: "Originally named 'Oak' in 1991 by James Gosling, it was later renamed Java after coffee." },
                { title: "Java Fact", icon: "⚙️", text: "The Java Virtual Machine (JVM) executes bytecode, enabling 'Write Once, Run Anywhere'." },
                { title: "Java Fact", icon: "📱", text: "Android OS applications have historically run on Java/Kotlin bytecode runtimes (Dalvik/ART)." }
            )
        } else if (lower.includes('python')) {
            facts.push(
                { title: "Python Fact", icon: "🐍", text: "Python was named after the British comedy troupe 'Monty Python', not the snake!" },
                { title: "Python Fact", icon: "⚡", text: "Created by Guido van Rossum and released in 1991 with a strong focus on code readability." },
                { title: "Python Fact", icon: "🧠", text: "Python is the primary language for machine learning, AI, and data science globally." }
            )
        } else if (lower.includes('javascript') || lower.includes('react') || lower.includes('web')) {
            facts.push(
                { title: "JS Fact", icon: "🌐", text: "JavaScript was created in just 10 days in May 1995 by Brendan Eich at Netscape." },
                { title: "Web Fact", icon: "⚡", text: "React was created by Jordan Walke, a software engineer at Facebook, and open-sourced in 2013." },
                { title: "JS Fact", icon: "🚀", text: "V8 engine compiles JavaScript directly to native machine code before executing it." }
            )
        } else if (lower.includes('history') || lower.includes('war')) {
            facts.push(
                { title: "History Lore", icon: "🏛️", text: "The Library of Alexandria was one of the largest and most significant libraries of the ancient world." },
                { title: "History Lore", icon: "⚔️", text: "Spartan hoplites trained from age 7 in the Agoge military system." }
            )
        } else if (lower.includes('science') || lower.includes('physics') || lower.includes('space')) {
            facts.push(
                { title: "Cosmic Fact", icon: "🌌", text: "Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth." },
                { title: "Science Fact", icon: "⚛️", text: "One teaspoon of a neutron star would weigh around 6 billion tons on Earth." }
            )
        } else {
            // General Knowledge & Battle Arena Lore
            facts.push(
                { title: "Arena Fact", icon: "🏆", text: `This tournament contains ${safeQuestions.length || 'multiple'} battle questions to test your knowledge!` },
                { title: "Champion Rule", icon: "⚔️", text: "First place requires both sharp accuracy and swift reaction times." }
            )
        }

        // Always include competitive arena combat tips
        facts.push(
            { title: "Arena Tip", icon: "⚡", text: "Points decay every second! Faster correct answers earn maximum quadratic bonus points." },
            { title: "Arena Tip", icon: "🛡️", text: "Wrong answers yield 0 points for that round. Think carefully before locking in!" }
        )

        return facts
    }

    // Dynamic Topic Icon Generator
    function getTopicIcon(title = "") {
        const safeTitle = typeof title === 'string' ? title : ""
        const lower = safeTitle.toLowerCase()
        if (lower.includes('java') && !lower.includes('javascript')) return '☕'
        if (lower.includes('python')) return '🐍'
        if (lower.includes('javascript') || lower.includes('react') || lower.includes('web')) return '⚡'
        if (lower.includes('history')) return '🏛️'
        if (lower.includes('science') || lower.includes('space')) return '🌌'
        if (lower.includes('math')) return '📐'
        return '⚔️'
    }

    // Dynamic Key Concepts extractor
    function getKeyConcepts(title = "", questions = [], description = "") {
        const safeDesc = typeof description === 'string' ? description.trim() : ""
        const safeQuestions = Array.isArray(questions) ? questions : []
        const concepts = []

        if (safeDesc) {
            concepts.push(safeDesc.slice(0, 45) + (safeDesc.length > 45 ? '...' : ''))
        }
        
        // Extract interesting keywords from questions
        if (safeQuestions.length > 0) {
            safeQuestions.slice(0, 3).forEach((q, i) => {
                const text = q && typeof q.questionText === 'string' ? q.questionText : ""
                if (text.length > 0) {
                    concepts.push(`Q${i+1}: ${text.slice(0, 35)}${text.length > 35 ? '...' : ''}`)
                }
            })
        }

        if (concepts.length < 3) {
            concepts.push("Speed & Precision Scoring")
            concepts.push("Live Arena Leaderboard")
            concepts.push("Multiplayer Showdown")
        }

        return concepts.slice(0, 4)
    }

    const dynamicTrivia = getDynamicTrivia(quizTitle, quizQuestions)
    const dynamicIcon = getTopicIcon(quizTitle)
    const dynamicConcepts = getKeyConcepts(quizTitle, quizQuestions, quizDescription)


    const stompClient = useRef(null)

    useEffect(() => {
        // Fetch room information
        fetch(`http://localhost:8080/api/rooms/${roomCode}`)
            .then(res => res.json())
            .then((data) => {
                if (data === null) {
                    navigate("/")
                } else {
                    setPlayers(data.players || [])
                }
            })
            .catch(err => console.log(err))

        // Fetch room quiz details
        fetch(`http://localhost:8080/api/rooms/${roomCode}/quiz`)
            .then(res => {
                if (!res.ok) return null
                return res.json()
            })
            .then((id) => {
                if (id == null) {
                    console.log(`Room with code ${roomCode} does not have quiz.`)
                    navigate("/")
                    return
                }

                fetch(`http://localhost:8080/api/quizzes/${id}`)
                    .then(res => {
                        if (!res.ok) return null
                        return res.json()
                    })
                    .then((data) => {
                        if (data == null) {
                            console.log(`No quiz found with Id ${id}`)
                            navigate("/")
                            return
                        }
                        setQuizId(id)
                        setQuizTitle(data.title)
                        setQuizDescription(data.description)
                        setQuestionCount(data.questions?.length || 0)
                        setQuizQuestions(data.questions || [])
                    })
            })

        // Connect STOMP WebSocket
        const socket = new SockJS('http://localhost:8080/ws')
        const client = Stomp.over(socket)
        client.debug = null
        client.connect({}, () => {
            stompClient.current = client
            setConnected(true)

            // Subscribe to room lobby updates
            client.subscribe(`/topic/room/waiting/${roomCode}`, (msg) => {
                const data = JSON.parse(msg.body)
                if (data && data.players) {
                    setPlayers(data.players)
                }
            })

            // Subscribe to direct player notifications
            client.subscribe(`/topic/player/${nickName}`, (msg) => {
                const data = JSON.parse(msg.body)
                setMyMsgs(data.message)
            })

            // Subscribe to room start signal
            client.subscribe(`/topic/room/waiting/start/${roomCode}`, () => {
                client.disconnect()
                navigate(`/room/${roomCode}?nickname=${nickName}`)
            })
        }, () => {
            setConnected(false)
        })

        return () => {
            if (stompClient.current) stompClient.current.disconnect()
        }
    }, [roomCode, nickName, navigate])

    function startGame() {
        if (!connected) {
            setMyMsgs("Not connected to server. Try refreshing.")
            return
        }
        setMyMsgs('')
        if (stompClient.current) {
            stompClient.current.send("/app/game/room/start", {}, JSON.stringify({
                roomCode: roomCode,
                hostNickName: nickName
            }))
        }
    }

    function handleSendChat(e) {
        e.preventDefault()
        if (!chatInput.trim()) return

        const newMsg = { sender: nickName, text: chatInput.trim() }
        setChatMessages(prev => [...prev, newMsg])
        setChatInput('')
    }

    function copyCodeToClipboard() {
        navigator.clipboard.writeText(roomCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Determine Host vs Other players
    const hostPlayer = (players && players.length > 0) ? players[0] : { nickName: isHost ? nickName : 'Host' }
    const otherPlayers = (players && players.length > 1) ? players.slice(1) : []

    // Progress Bar calculations (target: 2 minimum, max 10 for full bar)
    const totalSegments = 14
    const filledSegments = Math.min(totalSegments, Math.max(0, Math.floor(((players?.length || 0) / 2) * (totalSegments / 2))))

    return (
        <div className="min-h-screen bg-[#070a18] text-white relative overflow-hidden flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
            
            {/* Ambient Nebula Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-64 cyber-grid opacity-30 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black)]" />

            {/* Main Content Arena */}
            <div className="max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
                
                {/* ========================================================= */}
                {/* LEFT COLUMN: Room Code Plaque + Quiz Detail Card (3 cols) */}
                {/* ========================================================= */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                    
                    {/* Room Code Plaque */}
                    <div className="bg-slate-900/90 border-2 border-amber-500/80 rounded-2xl p-5 glow-amber text-center relative overflow-hidden backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase">Room Code</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[11px] font-semibold text-emerald-400">{connected ? 'Connected' : 'Offline'}</span>
                            </div>
                        </div>

                        <div 
                            onClick={copyCodeToClipboard}
                            title="Click to copy room code"
                            className="cursor-pointer group py-1"
                        >
                            <h2 className="text-4xl font-black font-mono tracking-widest text-white group-hover:text-amber-400 transition-colors drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                                {roomCode}
                            </h2>
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-200 mt-1">
                                {copied ? '✅ Copied to clipboard!' : '📋 Click to copy code'}
                            </p>
                        </div>
                    </div>

                    {/* Quiz Overview Card */}
                    <div className="bg-slate-900/85 border-2 border-purple-500/80 rounded-2xl p-5 glow-purple backdrop-blur-md flex flex-col justify-between flex-grow">
                        <div>
                            {/* Question Count Pill */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-purple-900/60 border border-purple-400/50 text-purple-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                    {questionCount} Questions <span className="text-pink-400">✨</span>
                                </span>
                            </div>

                            {/* Thumbnail / Theme Artwork */}
                            <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex items-center justify-center p-3 relative overflow-hidden mb-4 group">
                                <div className="absolute inset-0 bg-cyan-500/5 cyber-grid opacity-50" />
                                <div className="text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10 transition-transform group-hover:scale-110 duration-300">
                                    {dynamicIcon}
                                </div>
                            </div>

                            <h3 className="text-xl font-extrabold text-white leading-tight">{quizTitle || 'Loading Quiz...'}</h3>
                            <p className="text-xs text-purple-300/80 mt-1 mb-4">{quizDescription || 'Test your knowledge in the arena'}</p>

                            {/* Key Concepts List */}
                            <div className="border-t border-slate-800 pt-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key concepts</p>
                                <ul className="text-xs text-slate-300 space-y-1.5">
                                    {dynamicConcepts.map((concept, idx) => (
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

                {/* ========================================================= */}
                {/* CENTER COLUMN: Host Podium & Live Battle Arena (6 cols)   */}
                {/* ========================================================= */}
                <div className="lg:col-span-6 flex flex-col items-center justify-between min-h-[540px]">
                    
                    {/* Top Section: Host Podium */}
                    <div className="flex flex-col items-center relative w-full pt-2">
                        {/* Elevated Circular Glowing Pedestal */}
                        <div className="pedestal-stage rounded-full p-4 flex flex-col items-center relative">
                            <HostAvatar className="w-28 h-28 relative z-10" />
                            <div className="w-48 h-10 rounded-[50%] bg-purple-600/50 border border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.9)] flex items-center justify-center -mt-5 z-0" />
                        </div>

                        {/* Host Label & Nickname */}
                        <h3 className="text-xl font-black text-white tracking-wide mt-1 drop-shadow-md">
                            {hostPlayer?.nickName || 'Host'}
                        </h3>
                        <span className="bg-purple-600/80 border border-purple-400 text-purple-100 text-[10px] font-black uppercase tracking-widest px-3.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)] mt-1">
                            HOST
                        </span>
                    </div>

                    {/* Middle Section: Joined Players Arena Arc */}
                    <div className="w-full my-4">
                        <p className="text-xs font-bold text-center tracking-wider text-purple-300 uppercase mb-3">
                            Waiting for players: at least 2 needed
                        </p>

                        {/* Segmented Glowing LED Progress Bar */}
                        <div className="flex items-center justify-center gap-1.5 mb-6 px-4">
                            {Array.from({ length: totalSegments }).map((_, idx) => {
                                const isLit = idx < filledSegments
                                return (
                                    <div
                                        key={idx}
                                        className={`h-4 w-3 sm:w-4 rounded-sm transition-all duration-500 ${
                                            isLit
                                                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] scale-105'
                                                : 'bg-slate-800/90 border border-slate-700/60'
                                        }`}
                                    />
                                )
                            })}
                        </div>

                        {/* Player Avatars Grid (Max 4 per line) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-xl mx-auto justify-items-center min-h-[110px] px-2">
                            {otherPlayers.map((p, idx) => (
                                <div key={idx} className="w-24 flex flex-col items-center group animate-fade-in">
                                    <PlayerAvatar index={idx + 1} name={p?.nickName || `Player ${idx + 1}`} className="w-16 h-16" />
                                    <span 
                                        title={p?.nickName || `Player ${idx + 1}`}
                                        className="text-[11px] font-bold text-slate-200 mt-2 px-2 py-0.5 bg-slate-900/90 border border-slate-700 rounded-md truncate max-w-[90px] text-center"
                                    >
                                        {p?.nickName || `Player ${idx + 1}`}
                                    </span>
                                </div>
                            ))}

                            {/* Empty Placeholder Slots if under minimum */}
                            {Array.from({ length: Math.max(0, 3 - otherPlayers.length) }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="w-24 flex flex-col items-center opacity-40 hover:opacity-70 transition-opacity">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 bg-slate-900/40 flex items-center justify-center text-slate-500 text-xl font-bold">
                                        +
                                    </div>
                                    <span className="text-[11px] text-slate-500 mt-2">Open Slot</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action: Start Game CTA */}
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <div className="flex items-center gap-2 text-xs font-bold mb-2 text-slate-400">
                            <span>{players.length < 2 ? '🔒' : '🚀'}</span>
                            <span>{players.length < 2 ? 'Waiting for players...' : 'Ready to launch arena!'}</span>
                        </div>

                        {isHost ? (
                            <button
                                onClick={startGame}
                                disabled={players.length < 2}
                                className={`w-full py-4 rounded-xl font-black text-lg tracking-wider transition-all duration-300 ${
                                    players.length < 2
                                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-[0_0_30px_rgba(217,70,239,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                            >
                                START GAME
                            </button>
                        ) : (
                            <div className="w-full py-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center font-bold text-slate-300 text-sm tracking-wide animate-pulse">
                                Waiting for Host to Start...
                            </div>
                        )}

                        <span className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mt-3">
                            WAITING FOR PLAYERS...
                        </span>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: Trivia Ticker + Lobby Chat (3 cols)         */}
                {/* ========================================================= */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                    
                    {/* Trivia Ticker Widget */}
                    <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <span className="text-xs font-extrabold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                                <span>💡</span> Trivia Ticker ({quizTitle || 'Arena'})
                            </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
                            {dynamicTrivia.map((fact, idx) => (
                                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2.5 hover:border-purple-500/40 transition-colors">
                                    <span className="text-lg shrink-0 mt-0.5">{fact.icon}</span>
                                    <div>
                                        <h4 className="text-[11px] font-bold text-purple-300">{fact.title}</h4>
                                        <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{fact.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lobby Chat Widget */}
                    <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col flex-grow min-h-[220px]">
                        <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Lobby Chat</span>
                            </div>
                            <button
                                onClick={() => setChatMinimized(!chatMinimized)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                {chatMinimized ? '➕' : '➖'}
                            </button>
                        </div>

                        {!chatMinimized && (
                            <>
                                {/* Messages scroll area */}
                                <div className="flex-grow space-y-2 overflow-y-auto max-h-40 my-2 pr-1 text-xs">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`rounded-lg p-2 ${msg.isSystem ? 'bg-purple-950/40 border border-purple-900/50 text-purple-300' : 'bg-slate-950/80 border border-slate-800 text-slate-200'}`}>
                                            <span className="font-bold text-cyan-400 mr-1.5">{msg.sender}:</span>
                                            <span>{msg.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat input box */}
                                <form onSubmit={handleSendChat} className="flex gap-2 mt-auto pt-2 border-t border-slate-800">
                                    <input
                                        type="text"
                                        placeholder="Chat with players..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        ➤
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Error / System Alert Modal */}
            {myMsgs && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl glow-purple">
                        <p className="text-white font-bold text-base mb-6">{myMsgs}</p>
                        <button
                            onClick={() => setMyMsgs('')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-2.5 rounded-lg font-bold transition-all"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WaitingRoom