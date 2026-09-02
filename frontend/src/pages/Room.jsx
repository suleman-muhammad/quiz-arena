import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'
import { PlayerAvatar, HostAvatar } from "../components/CyberAvatar"

function Room() {
    const navigate = useNavigate()

    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname') || 'Gladiator'

    const [connected, setConnected] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [totalTime, setTotalTime] = useState(10)
    const [countdown, setCountdown] = useState(3)
    
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)

    const [gameState, setGameState] = useState('START')

    const [currQuestionNo, setCurrQuestionNo] = useState(0)
    const [questionText, setQuestionText] = useState('')
    const [optionA, setOptionA] = useState('')
    const [optionB, setOptionB] = useState('')
    const [optionC, setOptionC] = useState('')
    const [optionD, setOptionD] = useState('')
    const [answer, setAnswer] = useState('')

    const [leaderboard, setLeaderBoard] = useState([])
    const currectScore = useRef(0)
    const [totalScore, setTotalScore] = useState(0)
    const [position, setPosition] = useState(0)

    /*
     * ---------------------------------------------------------------------------------
     * 💡 NOTE FOR YOUR LOGIC PHASE (Add/Expand these whenever you are ready):
     * - streakCount: Track consecutive correct answers (e.g. 2x, 3x fire multiplier)
     * - playerSubmittedMap: Track real-time player answer submissions for checkmarks
     * - speedBonusPoints: Calculate extra points earned based on response speed
     * - isMuted: Toggle sound effects on/off
     * ---------------------------------------------------------------------------------
     */

    const [combo, setCombo] = useState(0);
    const [podiumStep, setPodiumStep] = useState(0);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Sequential Podium Reveal Timers (3rd at 400ms, 2nd at 1400ms, 1st at 2500ms)
    useEffect(() => {
        if (gameState === 'LEADERBOARD' || gameState === 'GAME_OVER') {
            setPodiumStep(0);
            const t1 = setTimeout(() => setPodiumStep(1), 400);  // Step 1: 3rd Place
            const t2 = setTimeout(() => setPodiumStep(2), 1400); // Step 2: 2nd Place
            const t3 = setTimeout(() => setPodiumStep(3), 2500); // Step 3: 1st Place Grand Champion
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        } else {
            setPodiumStep(0);
        }
    }, [gameState, currQuestionNo]);

    const stompClient = useRef(null)
    const hasLeftRef = useRef(false)

    function leaveRoom() {
        hasLeftRef.current = true
        if (stompClient.current && connected) {
            stompClient.current.send("/app/game/room/leave", {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickName
            }))
            setTimeout(() => {
                if (stompClient.current) stompClient.current.disconnect()
                setConnected(false)
            }, 150)
        }
        setGameState('LEFT')
    }

    useEffect(() => {
        fetch(`http://localhost:8080/api/rooms/${roomCode}`)
            .then(res => res.json())
            .then((data) => {
                if (data === null) {
                    navigate("/")
                }else{
                    setLeaderBoard(data.players ? data.players : [])

                    const me = data.players.find(p => p.nickName === nickName)
                    if (me){
                        setTotalScore(me.score)
                        setPosition(me.currentPos)
                    }
                }        
            })
            .catch(err => console.log(err))
        
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
                    })
            })

        const socket = new SockJS('http://localhost:8080/ws')
        const client = Stomp.over(socket)
        client.debug = null
        client.connect({}, () => {
            stompClient.current = client
            setConnected(true)

            client.subscribe(`/topic/room/${roomCode}/update`, (msg) => {
                if (hasLeftRef.current) return
                const roomInfo = JSON.parse(msg.body)
                console.log(roomInfo)
                setLeaderBoard(roomInfo.players);
            })

            client.subscribe(`/topic/room/play/question/text/${roomCode}`, (msg) => {
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("QUESTION")
                setCurrQuestionNo(data.questionNo)
                setQuestionText(data.questionText)
                currectScore.current = 0;
            })

            client.subscribe(`/topic/room/play/question/options/${roomCode}`, (msg) =>{
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("ANSWERING")
                setOptionA(data.optionA)
                setOptionB(data.optionB)
                setOptionC(data.optionC)
                setOptionD(data.optionD)
                setTimeLeft(data.timeLimit || 10)
                setTotalTime(data.timeLimit || 10)
            })

            client.subscribe(`/topic/room/play/question/stop/${roomCode}`, (msg) =>{
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)

                setTimeLeft(0)
                setTotalTime(0)
                setAnswer(data.answer)

                if(currectScore.current > 0){
                    setGameState('RESULT_CORRECT')
                    setCombo(combo + 1);
                }else{
                    setGameState("RESULT_WRONG")
                    setCombo(0)
                }
                setOptionA('')
                setOptionB('')
                setOptionC('')
                setOptionD('')
            })

            client.subscribe(`/topic/room/play/leaderboard/${roomCode}`, (msg) =>{
                if (hasLeftRef.current) return
                const players = JSON.parse(msg.body)
                console.log(players)
                setLeaderBoard(players)

                const me = players.find(p => p.nickName === nickName)
                if(me){
                    setTotalScore(me.score)
                    setPosition(me.currentPos)
                    setCombo(me.combo)
                }

                setGameState("LEADERBOARD")
            })

            client.subscribe(`/topic/room/${roomCode}/player/${nickName}`, (msg) => {
                if (hasLeftRef.current) return
                const result = JSON.parse(msg.body)
                switch(result.type){
                    case 'SCORES':
                        console.log(result)
                        currectScore.current = result.payLoad
                        break;
                    case 'ROOM_LEFT':
                        hasLeftRef.current = true
                        setGameState('LEFT')
                        break;
                }   
                
            })

            client.subscribe(`/topic/room/end/${roomCode}`, (msg) => {
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)
                setGameState('GAME_OVER')
            })
        }, () => {
            setConnected(false)
        })

        return () => {
            if (stompClient.current) stompClient.current.disconnect()
        }
    }, [roomCode, nickName, navigate])

    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    useEffect(() => {
        if (gameState !== 'START' || countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [gameState, countdown])

    function submitAnswer(val) {
        setGameState('SUBMITTED')
        if (stompClient.current) {
            stompClient.current.send("/app/game/room/answer", {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickName,
                questionNo: currQuestionNo,
                chosenOption: val,
                answeredAtMillis: Date.now()
            }))
        }
    }

    function getPosition(pos) {
        const places = ['st', 'nd', 'rd']
        if (pos >= 1 && pos <= 3) {
            return pos + places[pos - 1]
        }
        return (pos || 1) + 'th'
    }

    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = totalTime > 0 ? circumference - (timeLeft / totalTime) * circumference : circumference

    return (
        <div className="min-h-screen bg-[#050714] text-white relative overflow-hidden flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
            
            {/* ========================================================================= */}
            {/* OPTION A: CLEAN ESPORTS ARENA STAGE (Solid #050714 + 3D Grid Stage + HUD) */}
            {/* ========================================================================= */}

            {/* 1. Deep Space Vector Gradients & Radial Light Orbs */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.18)_0%,_transparent_65%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/12 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

            {/* 2. Ambient Twinkling Vector Stars */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <span className="absolute top-[8%] left-[12%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_6px_#38bdf8]" style={{ animationDelay: '0s' }} />
                <span className="absolute top-[14%] left-[28%] w-1 h-1 bg-purple-300 rounded-full animate-star shadow-[0_0_4px_#c084fc]" style={{ animationDelay: '1.2s' }} />
                <span className="absolute top-[6%] left-[48%] w-2 h-2 bg-cyan-200 rounded-full animate-star shadow-[0_0_8px_#67e8f9]" style={{ animationDelay: '2.1s' }} />
                <span className="absolute top-[18%] left-[64%] w-1 h-1 bg-amber-200 rounded-full animate-star shadow-[0_0_4px_#fde047]" style={{ animationDelay: '0.7s' }} />
                <span className="absolute top-[10%] left-[82%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_6px_#38bdf8]" style={{ animationDelay: '1.8s' }} />
                <span className="absolute top-[22%] left-[92%] w-1 h-1 bg-purple-200 rounded-full animate-star shadow-[0_0_4px_#e9d5ff]" style={{ animationDelay: '2.8s' }} />
            </div>

            {/* 3. Floating Geometric Energy Sparks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-1/4 left-[14%] w-2.5 h-2.5 bg-cyan-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(6,182,212,0.6)]" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-[16%] w-3 h-3 bg-purple-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(168,85,247,0.6)]" style={{ animationDelay: '2.5s' }} />
                <div className="absolute bottom-1/3 left-[22%] w-2 h-2 bg-amber-400/40 rotate-45 animate-vector-float shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ animationDelay: '1.2s' }} />
                <div className="absolute top-1/2 right-[10%] w-2 h-2 bg-pink-400/40 rotate-45 animate-vector-float shadow-[0_0_8px_rgba(236,72,153,0.6)]" style={{ animationDelay: '3.8s' }} />
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

                {/* Ambient Center Arena Orbital Radar Rings */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] text-purple-500/10 pointer-events-none" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
                    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
                    <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                </svg>
            </div>

            {/* 7. Radiant Vector Shockwave on Correct Answer */}
            {gameState === 'RESULT_CORRECT' && (
                <div className="absolute inset-0 pointer-events-none z-15">
                    <div className="absolute inset-0 bg-radial from-emerald-500/25 via-cyan-500/10 to-transparent animate-pulse" />
                    <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-emerald-500/35 via-cyan-500/15 to-transparent" />
                </div>
            )}

            {/* FLOATING TOP COMBAT HUD (No Heavy Navbar Bar)            */}
            <div className="relative z-20 px-4 sm:px-6 pt-4 pb-1">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    
                    {/* Room Code & Connection Indicator */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-md">
                            <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Room</span>
                            <span className="font-mono font-black text-amber-400 tracking-wider text-sm">{roomCode}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 backdrop-blur-sm">
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[11px] font-semibold text-slate-300">{connected ? 'Live' : 'Offline'}</span>
                        </div>
                    </div>

                    {/* Floating Question Progress Pill */}
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-400/50 text-purple-200 text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] backdrop-blur-md">
                            Question {currQuestionNo} of {questionCount || 5}
                        </div>
                    </div>

                    {/* Personal Combat Stats + Avatar + LEAVE Button */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1 flex items-center gap-3 backdrop-blur-md shadow-md">
                            <div className="text-right">
                                <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Rank</p>
                                <p className="text-xs font-black text-cyan-400">{getPosition(position)}</p>
                            </div>
                            <div className="h-5 w-px bg-slate-700/80" />
                            <div className="text-right">
                                <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Score</p>
                                <p className="text-xs font-black text-amber-300 flex items-center gap-1">
                                    <span>👑</span> {totalScore.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <PlayerAvatar name={nickName} className="w-9 h-9 border border-purple-500/50 shadow-md" />

                        {/* Leave Battle Button */}
                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            title="Leave Battle Arena"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                        >
                            <span>🚪</span>
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN BATTLE ARENA GRID (Left: 8 cols, Right: 4 cols)      */}
            <main className="max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
                
                {/* LEFT ARENA: Question Card, Timer & Answer Pads (8 cols)   */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                    
                    {/* Countdown Timer */}
                    <div className="flex justify-center mb-4">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    className="text-slate-800"
                                    fill="transparent"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ${
                                        timeLeft <= 3 ? 'text-rose-500 animate-pulse' :
                                        timeLeft <= 5 ? 'text-amber-400' : 'text-cyan-400'
                                    }`}
                                    fill="transparent"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-2xl font-black font-mono ${
                                    timeLeft <= 3 ? 'text-rose-400' : 'text-white'
                                }`}>
                                    {String(timeLeft).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">SEC</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border-2 border-purple-500/60 rounded-2xl p-6 sm:p-8 glow-purple backdrop-blur-md relative overflow-hidden mb-6 text-center">
                        <span className="bg-purple-950/80 border border-purple-400/50 text-purple-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                            Question {currQuestionNo} of {questionCount || 5}
                        </span>
                        
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed mt-2 drop-shadow-md">
                            {questionText || "Waiting for battle question to commence..."}
                        </h2>

                        {gameState === 'QUESTION' && (
                            <p className="text-xs text-purple-300 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                ⚔️ Answers unlocking shortly... Read carefully!
                            </p>
                        )}
                    </div>

                    {gameState === 'ANSWERING' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { 
                                    label: 'A', 
                                    text: optionA, 
                                    border: 'border-rose-500/70 hover:border-rose-400',
                                    bg: 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-rose-900/40',
                                    badge: 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.7)]',
                                    val: 0 
                                },
                                { 
                                    label: 'B', 
                                    text: optionB, 
                                    border: 'border-cyan-500/70 hover:border-cyan-400',
                                    bg: 'bg-gradient-to-br from-cyan-950/60 via-slate-900 to-cyan-900/40',
                                    badge: 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.7)]',
                                    val: 1 
                                },
                                { 
                                    label: 'C', 
                                    text: optionC, 
                                    border: 'border-emerald-500/70 hover:border-emerald-400',
                                    bg: 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-emerald-900/40',
                                    badge: 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                    val: 2 
                                },
                                { 
                                    label: 'D', 
                                    text: optionD, 
                                    border: 'border-amber-500/70 hover:border-amber-400',
                                    bg: 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-900/40',
                                    badge: 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                    val: 3 
                                },
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => submitAnswer(opt.val)}
                                    className={`${opt.bg} border-2 ${opt.border} rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-4 group cursor-pointer`}
                                >
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${opt.badge}`}>
                                        {opt.label}
                                    </span>
                                    <span className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-white leading-snug">
                                        {opt.text || `Option ${opt.label}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {gameState === 'SUBMITTED' && (
                        <div className="bg-slate-900/90 border-2 border-cyan-500/80 rounded-2xl p-8 glow-cyan text-center backdrop-blur-md">
                            <div className="text-4xl mb-3 animate-bounce">🔒</div>
                            <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
                            <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1">
                                Stand by while other gladiators submit...
                            </p>
                        </div>
                    )}

                    {gameState === 'RESULT_CORRECT' && (
                        <div className="bg-slate-900/95 border-2 border-emerald-400 rounded-3xl p-8 glow-emerald text-center backdrop-blur-md animate-victory-burst shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                            <div className="text-6xl mb-2 animate-bounce">👑</div>
                            <h3 className="text-3xl font-black text-emerald-400 tracking-wide drop-shadow-md">
                                CORRECT!
                            </h3>
                            <p className="text-xs font-black text-amber-300 uppercase tracking-widest mt-1 mb-3">
                                👏 THE ARENA STANDS UP & ROARS FOR YOU!
                            </p>
                            <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-400 px-5 py-2 rounded-full text-emerald-200 text-base font-black shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                                <span>⚡</span> +{currectScore.current || 940} PTS
                            </div>
                        </div>
                    )}

                    {gameState === 'RESULT_WRONG' && (
                        <div className="bg-slate-900/90 border-2 border-rose-500/80 rounded-2xl p-8 text-center backdrop-blur-md animate-fade-in">
                            <div className="text-5xl mb-2">❌</div>
                            <h3 className="text-2xl font-black text-rose-500">WRONG!</h3>
                            <p className="text-xs text-slate-300 mt-2">
                                Correct Answer: <span className="font-bold text-emerald-400">{answer}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT ARENA: Live Rival Mini-Leaderboard (4 cols)         */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col h-full justify-between">
                        
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <span className="text-xs font-extrabold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                                    <span>⚔️</span> Live Arena Standings
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Top 5
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {leaderboard.slice(0,5).map((p, index) => {
                                    const isMe = p.nickName === nickName
                                    const medals = ['🥇', '🥈', '🥉']
                                    const isTop3 = p.currentPos < 3

                                    return (
                                        <div
                                            key={p.currentPos || index}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                isMe
                                                    ? 'bg-purple-950/60 border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 text-center text-sm font-black">
                                                    {isTop3 ? medals[p.currentPos] : `#${p.currentPos}`}
                                                </span>

                                                <PlayerAvatar index={p.currentPos} name={p.nickName} className="w-8 h-8" />

                                                <div>
                                                    <p className={`text-xs font-black truncate max-w-[100px] ${isMe ? 'text-purple-200' : 'text-slate-200'}`}>
                                                        {isMe ? `${p.nickName} (You)` : p.nickName}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-amber-400 font-mono">
                                                    {p.score.toLocaleString() || 0}
                                                </span>
                                                <span className="text-emerald-400 text-xs font-bold" title="Submitted">
                                                    {gameState === "SUBMITTED" ? '✔' : ''}
                                                </span>
                                                <span className="text-emerald-400 text-xs font-bold" title="Submitted">
                                                    {p.combo > 1 ? p.combo + '🔥' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {leaderboard.length === 0 && (
                                    <div className="text-center py-6 text-slate-500 text-xs">
                                        Loading competitor scores...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/80 rounded-xl p-3 flex items-center justify-between border border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <PlayerAvatar name={nickName} className="w-8 h-8" />
                                <div>
                                    <p className="text-xs font-black text-white">{nickName}</p>
                                    <p className="text-[10px] font-bold text-purple-400">{getPosition(position)} place</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-amber-300 font-mono">
                                {totalScore.toLocaleString()} pts
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* OVERLAY: PRE-ROUND COUNTDOWN (Get Ready)                  */}
            {gameState === 'START' && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
                    <div className="text-center max-w-sm">
                        <div className="w-20 h-20 mx-auto mb-4">
                            <HostAvatar className="w-20 h-20" />
                        </div>
                        <h2 className="text-lg font-black text-purple-300 uppercase tracking-widest mb-1">
                            Prepare for battle!
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">First question starting in</p>
                        <span className="text-8xl font-black text-white animate-pulse font-mono drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]">
                            {countdown}
                        </span>
                    </div>
                </div>
            )}

            {/* OVERLAY: ROUND STANDINGS & GAME OVER PODIUM               */}
            {(gameState === 'LEADERBOARD' || gameState === 'GAME_OVER') && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl glow-purple backdrop-blur-xl animate-fade-in my-auto">
                        
                        <div className="text-5xl mb-2">
                            {gameState === 'GAME_OVER' ? '🏆' : '⚔️'}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-wide">
                            {gameState === 'GAME_OVER' ? 'Grand Tournament Victor!' : 'Round Standings'}
                        </h2>
                        <p className="text-xs text-purple-300 font-bold uppercase tracking-widest mt-1 mb-6">
                            {gameState === 'GAME_OVER' ? 'Final Arena Results' : `After Question ${currQuestionNo}`}
                        </p>

                        {/* Top 3 Champions Podium Arc (State-Driven Reveal: 3rd -> 2nd -> 1st) */}
                        <div className="flex items-end justify-center gap-2 sm:gap-3 mb-8 px-1 sm:px-2 min-h-[220px]">
                            {/* 2nd Place (Silver) - Pops up at Step 2 (1.4s) */}
                            <div className={`flex flex-col items-center flex-1 transition-all duration-700 ease-out transform ${
                                podiumStep >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[1] ? (
                                    <>
                                        <PlayerAvatar index={2} name={leaderboard[1].nickName} className="w-12 h-12 mb-2 border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.5)]" />
                                        <div className="w-full bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700/60 border-t-4 border-slate-300 rounded-t-xl p-2 flex flex-col items-center h-24 justify-between shadow-lg">
                                            <span className="text-sm font-black text-slate-300">🥈 2ND</span>
                                            <p className="text-[11px] font-black text-slate-100 truncate max-w-[85px]">{leaderboard[1].nickName}</p>
                                            <span className="text-[10px] font-mono text-slate-200 font-bold">{leaderboard[1].score?.toLocaleString()} pts</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center w-full opacity-30">
                                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-600 mb-2 flex items-center justify-center text-slate-500 text-xs font-bold">2</div>
                                        <div className="w-full bg-slate-900/60 border-t-2 border-slate-700 rounded-t-xl p-2 flex flex-col items-center h-20 justify-center">
                                            <span className="text-[10px] text-slate-500 font-bold">Open</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 1st Place (Gold Champion) - Grand Finale at Step 3 (2.5s) */}
                            <div className={`flex flex-col items-center flex-1 -mt-6 z-10 transition-all duration-800 ease-out transform ${
                                podiumStep >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[0] ? (
                                    <>
                                        <span className="text-2xl animate-bounce drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">👑</span>
                                        <PlayerAvatar index={1} name={leaderboard[0].nickName} className="w-16 h-16 mb-2 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)]" />
                                        <div className="w-full bg-gradient-to-t from-amber-950/90 via-amber-900/70 to-amber-600/50 border-t-4 border-amber-400 rounded-t-2xl p-2.5 flex flex-col items-center h-36 justify-between shadow-[0_0_35px_rgba(245,158,11,0.7)]">
                                            <span className="text-base font-black text-amber-300">🥇 1ST</span>
                                            <p className="text-xs font-black text-amber-100 truncate max-w-[90px]">{leaderboard[0].nickName}</p>
                                            <span className="text-xs font-mono text-amber-300 font-black">{leaderboard[0].score?.toLocaleString()} pts</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center w-full opacity-30">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500 mb-2 flex items-center justify-center text-amber-400 text-sm font-bold">1</div>
                                        <div className="w-full bg-slate-900/60 border-t-2 border-amber-500 rounded-t-xl p-2 flex flex-col items-center h-28 justify-center">
                                            <span className="text-[10px] text-amber-400 font-bold">No 1st</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3rd Place (Bronze) - Reveals First at Step 1 (0.4s) */}
                            <div className={`flex flex-col items-center flex-1 transition-all duration-700 ease-out transform ${
                                podiumStep >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[2] ? (
                                    <>
                                        <PlayerAvatar index={3} name={leaderboard[2].nickName} className="w-12 h-12 mb-2 border-2 border-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.5)]" />
                                        <div className="w-full bg-gradient-to-t from-slate-900 via-slate-800 to-amber-950/50 border-t-4 border-amber-700 rounded-t-xl p-2 flex flex-col items-center h-20 justify-between shadow-lg">
                                            <span className="text-sm font-black text-amber-600">🥉 3RD</span>
                                            <p className="text-[11px] font-black text-slate-200 truncate max-w-[85px]">{leaderboard[2].nickName}</p>
                                            <span className="text-[10px] font-mono text-amber-300 font-bold">{leaderboard[2].score?.toLocaleString()} pts</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center w-full opacity-30">
                                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-600 mb-2 flex items-center justify-center text-slate-500 text-xs font-bold">3</div>
                                        <div className="w-full bg-slate-900/60 border-t-2 border-slate-700 rounded-t-xl p-2 flex flex-col items-center h-16 justify-center">
                                            <span className="text-[10px] text-slate-500 font-bold">Open</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Full Scoreboard Rows */}
                        <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-1">
                            {leaderboard.map((p, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-500 w-4">{p.currentPos}</span>
                                        <span className="font-bold text-slate-200">{p.nickName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-amber-400 font-mono">
                                            {p.score.toLocaleString() || 0}
                                        </span>
                                        <span className="text-emerald-400 text-xs font-bold" title="Submitted">
                                            {p.combo > 1 ? p.combo + '🔥' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {gameState === 'GAME_OVER' && (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-base tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all cursor-pointer"
                            >
                                RETURN TO LOBBY
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* CONFIRM LEAVE MODAL */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900/95 border-2 border-rose-500/80 rounded-2xl p-6 max-w-sm w-full text-center shadow-[0_0_30px_rgba(244,63,94,0.35)] relative overflow-hidden">
                        <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-3xl mx-auto mb-4">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Abandon Battle?</h3>
                        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                            Are you sure you want to leave the arena? Your current score and combo streak will be forfeited.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLeaveConfirm(false)
                                    leaveRoom()
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
                            >
                                Confirm Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERLAY: PLAYER LEFT ARENA */}
            {gameState === 'LEFT' && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 border-2 border-purple-500/80 rounded-3xl p-8 max-w-md w-full text-center glow-purple relative overflow-hidden">
                        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                            🚪
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-wide">
                            You Have Left the Arena
                        </h2>
                        <p className="text-xs text-purple-300/80 mb-6 leading-relaxed">
                            You have disconnected from battle room <span className="font-mono font-bold text-amber-400">{roomCode}</span>.
                        </p>

                        {/* Match Stats Summary */}
                        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</p>
                                <p className="text-lg font-black text-amber-300 font-mono mt-0.5">
                                    👑 {totalScore.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-center border-l border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Rank</p>
                                <p className="text-lg font-black text-cyan-400 mt-0.5">
                                    {getPosition(position)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                            RETURN TO LOBBY
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Room