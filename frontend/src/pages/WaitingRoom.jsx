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
    const defaultCategory = { id: 'general', label: '⚔️ General Arena', icon: '⚔️' }

    const [connected, setConnected] = useState(false)
    const [copied, setCopied] = useState(false)
    const [players, setPlayers] = useState([])
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)
    const [quizQuestions, setQuizQuestions] = useState([])
    const [quizTriviaFacts, setQuizTriviaFacts] = useState([])
    const [quizConcepts , setQuizConcepts] = useState([])
    const [quizCategory, setQuizCategory] = useState(defaultCategory)

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { sender: 'Arena Master', text: 'Welcome champions to the QuizArena battle lobby!', isSystem: true }
    ])
    const [chatInput, setChatInput] = useState('')
    const [chatMinimized, setChatMinimized] = useState(false)

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
                        setQuizConcepts(data.concepts || [])
                        setQuizTriviaFacts(data.triviaFacts || []) 
                        setQuizCategory(data.category || defaultCategory)
                        // Set the Icon as well.
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
            client.subscribe(`/topic/rooms/${roomCode}/waiting`, (msg) => {
                const data = JSON.parse(msg.body)
                if (data && data.players) {
                    setPlayers(data.players)
                }
            })

            // Subscribe to direct player notifications
            client.subscribe(`/topic/rooms/${roomCode}/players/${nickName}`, (msg) => {
                const data = JSON.parse(msg.body)
                setMyMsgs(data.message)
            })

            // Subscribe to room start signal
            client.subscribe(`/topic/rooms/${roomCode}/waiting/start`, () => {
                client.disconnect()
                navigate(`/rooms/${roomCode}?nickname=${nickName}`)
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
            stompClient.current.send("/app/game/rooms/start", {}, JSON.stringify({
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

    function leaveRoom(){
        if (stompClient.current) {
            stompClient.current.send("/app/game/rooms/leave", {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickName
            }))
        }
        navigate("/")
    }

    const hostPlayer = (players && players.length > 0) ? players[0] : { nickName: isHost ? nickName : 'Host' }
    const otherPlayers = (players && players.length > 1) ? players.slice(1) : []

    const totalSegments = 14
    const filledSegments = Math.min(totalSegments, Math.max(0, Math.floor(((players?.length || 0) / 2) * (totalSegments / 2))))

    return (
        <div className="min-h-screen bg-[#050714] text-white relative overflow-hidden flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
            
            {/* ========================================================================= */}
            {/* LUMINOUS ESPORTS STAGING DECK (Depth Flares + 3D Grid + Tactical Vectors) */}
            {/* ========================================================================= */}

            {/* 1. Luminous Deep Space Radial Flares & Ambient Light Orbs */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.22)_0%,_transparent_65%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-purple-600/18 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />

            {/* 2. Twinkling Ambient Starfield */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span className="absolute top-[8%] left-[10%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_6px_#38bdf8]" style={{ animationDelay: '0s' }} />
                <span className="absolute top-[15%] left-[25%] w-1 h-1 bg-purple-300 rounded-full animate-star shadow-[0_0_4px_#c084fc]" style={{ animationDelay: '1.2s' }} />
                <span className="absolute top-[6%] left-[50%] w-2 h-2 bg-cyan-200 rounded-full animate-star shadow-[0_0_8px_#67e8f9]" style={{ animationDelay: '2.1s' }} />
                <span className="absolute top-[18%] left-[70%] w-1 h-1 bg-amber-200 rounded-full animate-star shadow-[0_0_4px_#fde047]" style={{ animationDelay: '0.7s' }} />
                <span className="absolute top-[12%] left-[85%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_6px_#38bdf8]" style={{ animationDelay: '1.8s' }} />
                <span className="absolute top-[22%] left-[94%] w-1 h-1 bg-purple-200 rounded-full animate-star shadow-[0_0_4px_#e9d5ff]" style={{ animationDelay: '2.8s' }} />
            </div>

            {/* 3. Floating Geometric Energy Sparks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-1/4 left-[12%] w-2.5 h-2.5 bg-cyan-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(6,182,212,0.6)]" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-[14%] w-3 h-3 bg-purple-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(168,85,247,0.6)]" style={{ animationDelay: '2.5s' }} />
                <div className="absolute bottom-1/3 left-[20%] w-2 h-2 bg-amber-400/40 rotate-45 animate-vector-float shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ animationDelay: '1.2s' }} />
                <div className="absolute top-1/2 right-[8%] w-2 h-2 bg-pink-400/40 rotate-45 animate-vector-float shadow-[0_0_8px_rgba(236,72,153,0.6)]" style={{ animationDelay: '3.8s' }} />
            </div>

            {/* 4. 3D Perspective Vector Grid Stage Floor (Infinite Forward Motion) */}
            <div className="absolute -bottom-10 inset-x-0 h-[44vh] vector-grid-3d pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.85)_35%,black_100%)] opacity-70" />

            {/* 5. Glowing Vector Horizon Beam */}
            <div className="absolute bottom-[40vh] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shadow-[0_0_18px_rgba(6,182,212,0.9)] pointer-events-none" />

            {/* 6. Tactical HUD Corner Brackets & Orbital Rings */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {/* Top-Left Vector Bracket */}
                <svg className="absolute top-14 left-6 w-32 h-32 text-purple-500/35 animate-circuit-pulse" viewBox="0 0 100 100" fill="none">
                    <path d="M0 40 L0 0 L40 0" stroke="currentColor" strokeWidth="2" />
                    <circle cx="4" cy="4" r="2.5" fill="currentColor" />
                    <line x1="12" y1="12" x2="35" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Top-Right Vector Bracket */}
                <svg className="absolute top-14 right-6 w-32 h-32 text-cyan-400/35 animate-circuit-pulse" viewBox="0 0 100 100" fill="none">
                    <path d="M100 40 L100 0 L60 0" stroke="currentColor" strokeWidth="2" />
                    <circle cx="96" cy="4" r="2.5" fill="currentColor" />
                    <line x1="88" y1="12" x2="65" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Ambient Center Orbital Radar Rings */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] text-purple-500/10 pointer-events-none" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
                    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
                    <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                </svg>
            </div>

            {/* FLOATING TOP LOBBY HUD                                  */}
            <div className="relative z-20 px-4 sm:px-6 pt-4 pb-0 w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black tracking-wider text-purple-300 flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-md">
                        <span>⚔️</span> <span className="text-white">QUIZ</span>ARENA LOBBY
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1 backdrop-blur-md shadow-md">
                        <PlayerAvatar name={nickName} className="w-7 h-7" />
                        <span className="text-xs font-bold text-slate-200">{nickName}</span>
                    </div>

                    {/* Leave Lobby Button */}
                    <button
                        onClick={leaveRoom}
                        title="Leave Battle Lobby"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                    >
                        <span>🚪</span>
                        <span className="hidden sm:inline">Leave</span>
                    </button>
                </div>
            </div>

            {/* Main Content Arena */}
            <div className="max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
    
                {/* LEFT COLUMN: Room Code Plaque + Quiz Detail Card (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-5">
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

                    <div className="bg-slate-900/85 border-2 border-purple-500/80 rounded-2xl p-5 glow-purple backdrop-blur-md flex flex-col justify-between flex-grow">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-purple-900/60 border border-purple-400/50 text-purple-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                    {questionCount} Questions <span className="text-pink-400">✨</span>
                                </span>
                                {/* 🏷️ CATEGORY BADGE */}
                                <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    {quizCategory?.label || '⚔️ General Arena'}
                                </span>
                            </div>

                            <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex items-center justify-center p-3 relative overflow-hidden mb-4 group">
                                <div className="absolute inset-0 bg-cyan-500/5 cyber-grid opacity-50" />
                                <div className="text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10 transition-transform group-hover:scale-110 duration-300">
                                    {quizCategory.icon}
                                </div>
                            </div>

                            <h3 className="text-xl font-extrabold text-white leading-tight">{quizTitle || 'Loading Quiz...'}</h3>
                            <p className="text-xs text-purple-300/80 mt-1 mb-4">{quizDescription || 'Test your knowledge in the arena'}</p>

                            <div className="border-t border-slate-800 pt-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key concepts</p>
                                <ul className="text-xs text-slate-300 space-y-1.5">
                                    {quizConcepts.map((c, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                idx % 4 === 0 ? 'bg-purple-400' :
                                                idx % 4 === 1 ? 'bg-cyan-400' :
                                                idx % 4 === 2 ? 'bg-pink-400' : 'bg-emerald-400'
                                            }`} />
                                            <span className="truncate">{c?.concept}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: Host Podium & Live Battle Arena (6 cols)   */}
                <div className="lg:col-span-6 flex flex-col items-center justify-between min-h-[540px]">
                    
                    {/*Host Podium */}
                    <div className="flex flex-col items-center relative w-full pt-2">
                        <div className="pedestal-stage rounded-full p-4 flex flex-col items-center relative">
                            <HostAvatar className="w-28 h-28 relative z-10" />
                            <div className="w-48 h-10 rounded-[50%] bg-purple-600/50 border border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.9)] flex items-center justify-center -mt-5 z-0" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-wide mt-1 drop-shadow-md">
                            {hostPlayer?.nickName || 'Host'}
                        </h3>
                        <span className="bg-purple-600/80 border border-purple-400 text-purple-100 text-[10px] font-black uppercase tracking-widest px-3.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)] mt-1">
                            HOST
                        </span>
                    </div>

                    {/* Joined Players Arena Arc */}
                    <div className="w-full my-4">
                        <p className="text-xs font-bold text-center tracking-wider text-purple-300 uppercase mb-3">
                            Waiting for players: at least 2 needed
                        </p>
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

                            {/* Empty Placeholder */ }
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

                    {/* Start Game CTA */}
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

                {/* RIGHT COLUMN: Trivia Ticker + Lobby Chat (3 cols)         */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                    
                    <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <span className="text-xs font-extrabold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                                <span>💡</span> Trivia Ticker ({quizTitle || 'Arena'})
                            </span>
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
                            {quizTriviaFacts.map((fact, idx) => (
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
                                {/* scroll area */}
                                <div className="flex-grow space-y-2 overflow-y-auto max-h-40 my-2 pr-1 text-xs">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`rounded-lg p-2 ${msg.isSystem ? 'bg-purple-950/40 border border-purple-900/50 text-purple-300' : 'bg-slate-950/80 border border-slate-800 text-slate-200'}`}>
                                            <span className="font-bold text-cyan-400 mr-1.5">{msg.sender}:</span>
                                            <span>{msg.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* input box */}
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
