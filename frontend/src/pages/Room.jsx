import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { PlayerAvatar, HostAvatar } from "../components/CyberAvatar"
import { API_BASE_URL, WS_BASE_URL } from "../config/api"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'


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

    const [leaderboard, setLeaderboard] = useState([])
    const roundScore = useRef(0)
    const [totalScore, setTotalScore] = useState(0)
    const [position, setPosition] = useState(0)

    const [combo, setCombo] = useState(0);
    const [podiumStep, setPodiumStep] = useState(0);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    useEffect(() => {
        if (gameState === 'LEADERBOARD' || gameState === 'GAME_OVER') {
            setPodiumStep(0);
            const t1 = setTimeout(() => setPodiumStep(1), 400);  
            const t2 = setTimeout(() => setPodiumStep(2), 1400); 
            const t3 = setTimeout(() => setPodiumStep(3), 2500); 
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
            stompClient.current.send("/app/game/rooms/leave", {}, JSON.stringify({
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
        fetch(`${API_BASE_URL}/api/rooms/${roomCode}`)
            .then(res => res.json())
            .then((roomInfo) => {
                if (roomInfo === null) {
                    navigate("/")
                }else{
                    setLeaderboard(roomInfo.players ? roomInfo.players : [])

                    const me = roomInfo.players.find(p => p.nickName === nickName)
                    if (me){
                        setTotalScore(me.score)
                        setPosition(me.currentPosition)
                    }

                    fetch(`${API_BASE_URL}/api/quizzes/${roomInfo.quizId}`)
                    .then(res => {
                        if (!res.ok) return null
                        return res.json()
                    })
                    .then((quizInfo) => {
                        if (quizInfo == null) {
                            console.log(`No quiz found with Id ${roomInfo.quizId}`)
                            navigate("/")
                            return
                        }
                        setQuizId(roomInfo.quizId)
                        setQuizTitle(quizInfo.title)
                        setQuizDescription(quizInfo.description)
                        setQuestionCount(quizInfo.questions?.length || 0)
                    })
                }        
            })
            .catch(err => console.log(err))
        
        const socket = new SockJS(WS_BASE_URL)
        const client = Stomp.over(socket)
        client.debug = null
        client.connect({}, () => {
            stompClient.current = client
            setConnected(true)

            client.subscribe(`/topic/rooms/${roomCode}/roster`, (msg) => {
                if (hasLeftRef.current) return
                const roomInfo = JSON.parse(msg.body)
                console.log(roomInfo)
                setLeaderboard(roomInfo.players);
            })

            client.subscribe(`/topic/rooms/${roomCode}/question/text`, (msg) => {
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("QUESTION")
                setCurrQuestionNo(data.questionNo)
                setQuestionText(data.questionText)
                roundScore.current = 0;
            })

            client.subscribe(`/topic/rooms/${roomCode}/question/options`, (msg) =>{
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

            client.subscribe(`/topic/rooms/${roomCode}/question/stop`, (msg) =>{
                if (hasLeftRef.current) return
                const data = JSON.parse(msg.body)
                console.log(data)

                setTimeLeft(0)
                setTotalTime(0)
                setAnswer(data.answer)

                if(roundScore.current > 0){
                    setGameState('RESULT_CORRECT')
                    setCombo(prev => prev + 1);
                }else{
                    setGameState("RESULT_WRONG")
                    setCombo(0)
                }
                setOptionA('')
                setOptionB('')
                setOptionC('')
                setOptionD('')
            })

            client.subscribe(`/topic/rooms/${roomCode}/leaderboard`, (msg) =>{
                if (hasLeftRef.current) return
                const players = JSON.parse(msg.body)
                console.log(players)
                setLeaderboard(players)

                const me = players.find(p => p.nickName === nickName)
                if(me){
                    setTotalScore(me.score)
                    setPosition(me.currentPosition)
                    setCombo(me.combo)
                }

                setGameState("LEADERBOARD")
            })

            client.subscribe(`/topic/rooms/${roomCode}/players/${nickName}`, (msg) => {
                if (hasLeftRef.current) return
                const result = JSON.parse(msg.body)
                switch(result.type){
                    case 'SCORES':
                        console.log(result)
                        if(result.payload >= 0) roundScore.current = result.payload
                        break;
                    case 'ROOM_LEFT':
                        hasLeftRef.current = true
                        setGameState('LEFT')
                        break;
                }   
                
            })

            client.subscribe(`/topic/rooms/${roomCode}/end`, (msg) => {
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
            stompClient.current.send("/app/game/rooms/answer", {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickName,
                questionNo: currQuestionNo,
                chosenOption: val,
                answeredAtMillis: Date.now()
            }))
        }
    }

    function getOrdinalPosition(pos) {
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
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="relative z-20 px-4 sm:px-6 pt-4 pb-1">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-[#111827] border border-gray-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Room</span>
                            <span className="font-mono font-black text-amber-400 tracking-wider text-sm">{roomCode}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 bg-[#111827] border border-gray-800 rounded-lg px-2.5 py-1">
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[11px] font-semibold text-slate-300">{connected ? 'Live' : 'Offline'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-[#111827] border border-gray-800 text-gray-300 text-xs font-semibold px-4 py-1.5 rounded-lg">
                            Question {currQuestionNo} of {questionCount || 5}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-[#111827] border border-gray-800 rounded-xl px-3 py-1 flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Rank</p>
                                <p className="text-xs font-black text-amber-400">{getOrdinalPosition(position)}</p>
                            </div>
                            <div className="h-5 w-px bg-slate-700/80" />
                            <div className="text-right">
                                <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Score</p>
                                <p className="text-xs font-black text-amber-300 flex items-center gap-1">
                                    <span>👑</span> {totalScore.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <PlayerAvatar name={nickName} className="w-9 h-9" />

                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            title="Leave Battle Arena"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                            <span>🚪</span>
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
                
                <div className="lg:col-span-8 flex flex-col justify-between">
                    
                    <div className="w-full max-w-3xl bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <span className="text-amber-400 font-mono">Question {currQuestionNo} / {questionCount || 5}</span>
                            <span>{String(timeLeft).padStart(2, '0')} sec</span>
                        </div>

                        <div className="w-full h-2 bg-[#0A0E1A] border border-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                                style={{ width: `${totalTime > 0 ? (timeLeft / totalTime) * 100 : 0}%` }}
                            />
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] tracking-tight leading-snug text-center py-2">
                            {questionText || "Waiting for battle question to commence..."}
                        </h2>

                        {gameState === 'QUESTION' && (
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                ⚔️ Answers unlocking shortly... Read carefully!
                            </p>
                        )}
                    </div>

                    {gameState === 'ANSWERING' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {[
                                { 
                                    label: 'A', 
                                    text: optionA, 
                                    border: 'border-gray-800 hover:border-gray-700',
                                    bg: 'bg-[#0A0E1A] hover:bg-[#0f1422]',
                                    badge: '',
                                    val: 0 
                                },
                                { 
                                    label: 'B', 
                                    text: optionB, 
                                    border: 'border-gray-800 hover:border-gray-700',
                                    bg: 'bg-[#0A0E1A] hover:bg-[#0f1422]',
                                    badge: '',
                                    val: 1 
                                },
                                { 
                                    label: 'C', 
                                    text: optionC, 
                                    border: 'border-gray-800 hover:border-gray-700',
                                    bg: 'bg-[#0A0E1A] hover:bg-[#0f1422]',
                                    badge: '',
                                    val: 2 
                                },
                                { 
                                    label: 'D', 
                                    text: optionD, 
                                    border: 'border-gray-800 hover:border-gray-700',
                                    bg: 'bg-[#0A0E1A] hover:bg-[#0f1422]',
                                    badge: '',
                                    val: 3 
                                },
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => submitAnswer(opt.val)}
                                    className={`${opt.bg} border ${opt.border} w-full text-left p-4 rounded-xl text-[#F9FAFB] font-medium transition-all flex items-center gap-3.5 active:scale-[0.99] group cursor-pointer`}
                                >
                                    <span className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700/60 text-gray-300 font-mono text-xs font-bold flex items-center justify-center group-hover:border-gray-600 transition-colors shrink-0">
                                        {opt.label}
                                    </span>
                                    <span className="leading-snug">
                                        {opt.text || `Option ${opt.label}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {gameState === 'SUBMITTED' && (
                        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-center">
                            <div className="text-4xl mb-3 animate-bounce">🔒</div>
                            <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                                Stand by while other gladiators submit...
                            </p>
                        </div>
                    )}

                    {gameState === 'RESULT_CORRECT' && (
                        <div className="bg-[#111827] border border-emerald-500 rounded-2xl p-6 text-center animate-victory-burst">
                            <div className="text-6xl mb-2 animate-bounce">👑</div>
                            <h3 className="text-3xl font-black text-emerald-300 tracking-wide">
                                CORRECT!
                            </h3>
                            <p className="text-xs font-black text-amber-300 uppercase tracking-widest mt-1 mb-3">
                                👏 THE ARENA STANDS UP & ROARS FOR YOU!
                            </p>
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500 px-5 py-2 rounded-xl text-emerald-300 text-base font-black">
                                <span>⚡</span> +{roundScore.current || 940} PTS
                            </div>
                        </div>
                    )}

                    {gameState === 'RESULT_WRONG' && (
                        <div className="bg-[#111827] border border-rose-500 rounded-2xl p-6 text-center animate-fade-in">
                            <div className="text-5xl mb-2">❌</div>
                            <h3 className="text-2xl font-black text-rose-500">WRONG!</h3>
                            <p className="text-xs text-slate-300 mt-2">
                                Correct Answer: <span className="font-bold text-emerald-400">{answer}</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col h-full justify-between">
                        
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <span className="text-xs font-extrabold tracking-wider uppercase text-gray-300 flex items-center gap-1.5">
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
                                    const isTop3 = p.currentPosition < 3

                                    return (
                                        <div
                                            key={p.currentPosition || index}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                isMe
                                                    ? 'bg-amber-500/10 border-amber-500/60'
                                                    : 'bg-[#0A0E1A] border-gray-800 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 text-center text-sm font-black">
                                                    {isTop3 ? medals[p.currentPosition] : `#${p.currentPosition}`}
                                                </span>

                                                <PlayerAvatar index={p.currentPosition} name={p.nickName} className="w-8 h-8" />

                                                <div>
                                                    <p className={`text-xs font-black truncate max-w-[100px] ${isMe ? 'text-amber-300' : 'text-slate-200'}`}>
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
                                    <p className="text-[10px] font-bold text-amber-400">{getOrdinalPosition(position)} place</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-amber-300 font-mono">
                                {totalScore.toLocaleString()} pts
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {gameState === 'START' && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
                    <div className="text-center max-w-sm">
                        <div className="w-20 h-20 mx-auto mb-4">
                            <HostAvatar className="w-20 h-20" />
                        </div>
                        <h2 className="text-lg font-black text-amber-400 uppercase tracking-widest mb-1">
                            Prepare for battle!
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">First question starting in</p>
                        <span className="text-8xl font-black text-[#F9FAFB] animate-pulse font-mono">
                            {countdown}
                        </span>
                    </div>
                </div>
            )}

            {(gameState === 'LEADERBOARD' || gameState === 'GAME_OVER') && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl animate-fade-in my-auto">
                        
                        <div className="text-5xl mb-2">
                            {gameState === 'GAME_OVER' ? '🏆' : '⚔️'}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-wide">
                            {gameState === 'GAME_OVER' ? 'Grand Tournament Victor!' : 'Round Standings'}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 mb-6">
                            {gameState === 'GAME_OVER' ? 'Final Arena Results' : `After Question ${currQuestionNo}`}
                        </p>

                        <div className="flex items-end justify-center gap-2 sm:gap-3 mb-8 px-1 sm:px-2 min-h-[220px]">
                            <div className={`flex flex-col items-center flex-1 transition-all duration-700 ease-out transform ${
                                podiumStep >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[1] ? (
                                    <>
                                        <PlayerAvatar index={2} name={leaderboard[1].nickName} className="w-12 h-12 mb-2" />
                                        <div className="bg-[#0A0E1A] border border-gray-700 rounded-xl p-4 flex items-center justify-between w-full">
                                            <span className="bg-slate-700 text-slate-200 font-mono text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center">2</span>
                                            <p className="text-[11px] font-black text-slate-100 truncate max-w-[85px]">{leaderboard[1].nickName}</p>
                                            <span className="text-sm font-mono font-bold text-gray-300">{leaderboard[1].score?.toLocaleString()} pts</span>
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

                            <div className={`flex flex-col items-center flex-1 -mt-6 z-10 transition-all duration-800 ease-out transform ${
                                podiumStep >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[0] ? (
                                    <>
                                        <span className="text-2xl animate-bounce text-amber-400">👑</span>
                                        <PlayerAvatar index={1} name={leaderboard[0].nickName} className="w-16 h-16 mb-2" />
                                        <div className="bg-[#111827] border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between w-full shadow-lg shadow-amber-500/5">
                                            <span className="w-8 h-8 rounded-lg bg-amber-500 text-gray-950 font-bold font-mono flex items-center justify-center">1</span>
                                            <p className="text-xs font-black text-amber-100 truncate max-w-[90px]">{leaderboard[0].nickName}</p>
                                            <span className="text-lg font-mono font-bold text-amber-400">{leaderboard[0].score?.toLocaleString()} pts</span>
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

                            <div className={`flex flex-col items-center flex-1 transition-all duration-700 ease-out transform ${
                                podiumStep >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-75 pointer-events-none'
                            }`}>
                                {leaderboard[2] ? (
                                    <>
                                        <PlayerAvatar index={3} name={leaderboard[2].nickName} className="w-12 h-12 mb-2" />
                                        <div className="bg-[#0A0E1A] border border-gray-800 rounded-xl p-4 flex items-center justify-between w-full">
                                            <span className="bg-amber-900/60 text-amber-200 font-mono text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center">3</span>
                                            <p className="text-[11px] font-black text-slate-200 truncate max-w-[85px]">{leaderboard[2].nickName}</p>
                                            <span className="text-sm font-mono font-bold text-amber-300">{leaderboard[2].score?.toLocaleString()} pts</span>
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

                        <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-1">
                            {leaderboard.map((p, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-500 w-4">{p.currentPosition}</span>
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
                                className="bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm inline-flex items-center justify-center gap-2"
                            >
                                RETURN TO LOBBY
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
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
                                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                            >
                                Confirm Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'LEFT' && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="w-16 h-16 rounded-2xl bg-[#0A0E1A] border border-gray-800 flex items-center justify-center text-4xl mx-auto mb-4 text-amber-400">
                            🚪
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-wide">
                            You Have Left the Arena
                        </h2>
                        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                            You have disconnected from battle room <span className="font-mono font-bold text-amber-400">{roomCode}</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</p>
                                <p className="text-lg font-black text-amber-300 font-mono mt-0.5">
                                    👑 {totalScore.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-center border-l border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Rank</p>
                                    <p className="text-lg font-black text-amber-400 mt-0.5">
                                    {getOrdinalPosition(position)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm tracking-wider shadow-md transition-all cursor-pointer active:scale-[0.98]"
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