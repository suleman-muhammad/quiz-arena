import { useState,useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'

function Room(){

    const navigate = useNavigate()

    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname')

    const [connected, setConnected] = useState(false)
    
    const [players, setPlayers] = useState([])
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


    const [leaderboard, setLeaderBoard]  = useState([])
    const currectScore = useRef(0)
    

    const stompClient = useRef(null)
    useEffect(() => {
        fetch(`http://localhost:8080/api/rooms/${roomCode}`)
            .then(res => res.json())
            .then((data) => {
                if(data === null){
                    navigate("/")
                }else{
                    setPlayers(data.players)
                }        
            })
            .catch(err => console.log(err))
        
        fetch(`http://localhost:8080/api/rooms/${roomCode}/quiz`)
            .then(res => {
                if(!res.ok){
                    return null
                }
                return res.json()
            })
            .then((quizId) => {
                if(quizId == null){
                    console.log(`Room with code ${roomCode} does not have quiz.`);
                    navigate("/")
                }
                
                fetch(`http://localhost:8080/api/quizzes/${quizId}`)
                .then(res => {
                    if(!res.ok){
                        return null
                    }
                    return res.json()
                })
                .then((data) => {
                    if(data == null){
                        console.log(`No quiz found with Id ${quizId}`)
                        navigate("/")
                    }
                    setQuizId(quizId)
                    setQuizTitle(data.title)
                    setQuizDescription(data.description)
                    setQuestionCount(data.questions.length)
                })
            })
        fetch(`http://localhost:8080/api/rooms/${roomCode}/leaderboard`)
            .then(res => res.json())
            .then((players) => {
                console.log(players)
                setLeaderBoard(players.slice(0,5));
            })


        const socket = new SockJS('http://localhost:8080/ws')
        const client = Stomp.over(socket)
        client.debug = null
        client.connect({},() =>{
            stompClient.current = client;
            setConnected(true)
            client.subscribe(`/topic/room/update/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)
            })

            client.subscribe(`/topic/room/play/question/text/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("QUESTION")

                setCurrQuestionNo(data.questionNo)
                setQuestionText(data.questionText)
            })

            client.subscribe(`/topic/room/play/question/options/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("ANSWERING")

                setOptionA(data.optionA)
                setOptionB(data.optionB)
                setOptionC(data.optionC)
                setOptionD(data.optionD)
                
                //TODO time setting.
            })

            client.subscribe(`/topic/room/play/question/stop/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setAnswer(data.answer);
                setGameState('STOPPED') // not needed.

                if(currectScore.current > 0){
                    setGameState('RESULT_CORRECT');
                }else{
                    setGameState("RESULT_WRONG")
                }
                setCurrQuestionNo('')
                setOptionA('')
                setOptionB('')
                setOptionC('')
                setOptionD('')
                //TODO time setting.
            })

            client.subscribe(`/topic/room/play/leaderboard/${roomCode}`, (msg) =>{
                const players = JSON.parse(msg.body)
                console.log(players)
                setLeaderBoard(players.slice(0,5));

                setGameState("LEADERBOARD")
                // set leader Board to updated one.
            })

            client.subscribe(`/topic/room/${roomCode}/player/${nickName}/scores`, (msg) =>{
                const result = JSON.parse(msg.body)
                console.log(result)
                currectScore.current = result;
            })



            client.subscribe(`/topic/room/end/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState('ENDED')

                // show Results.
            })

        })
        return () => {
            if (stompClient.current) stompClient.current.disconnect()
        }
    },[])

    

    function submitAnswer(val){
        setGameState('SUBMITTED');
        console.log(val);
        stompClient.current.send("/app/game/room/answer",{},JSON.stringify({
            roomCode:roomCode,
            playerNickName:nickName,
            questionNo:currQuestionNo,
            chosenOption:val,
            answeredAtMillis:Date.now()
        }))
    }
    function handleHomeButton(){
        navigate("/")
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Top bar */}
            <div className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-neutral-400 text-sm font-semibold uppercase tracking-wide">Room</span>
                    <span className="font-mono font-bold text-neutral-800 tracking-widest">{roomCode}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-sm font-medium">Question</span>
                    <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {currQuestionNo} / {questionCount} 
                    </span>
                </div>
            </div>

            {/* Main content - two columns */}
            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-3 gap-8">

                    {/* Left column - Question + Options (2/3) */}
                    <div className="col-span-2">

                        {/* Timer bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-neutral-500 text-sm font-medium">Time remaining</span>
                                <span className="text-neutral-800 font-bold text-lg">8s</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-rose-500 to-orange-400 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: '53%' }}
                                ></div>
                            </div>
                        </div>

                        {/* Question card */}
                        {/* State 2: Question only - centered, big */}
                        {gameState === 'QUESTION' && (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="bg-white border border-neutral-200 rounded-xl p-12 shadow-sm w-full">
                                    <p className="text-3xl font-bold text-neutral-800 text-center leading-relaxed">
                                        {questionText}
                                    </p>
                                    <p className="text-neutral-400 text-sm text-center mt-4">Options coming soon...</p>
                                </div>
                            </div>
                        )}

                        {/* State 3: Question + Options */}
                        {gameState === 'ANSWERING' && (
                            <>
                                <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6 shadow-sm">
                                    <p className="text-2xl font-bold text-neutral-800 text-center leading-relaxed">
                                        {questionText}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'A', text: optionA, color: 'bg-rose-500 hover:bg-rose-400', value: 0 },
                                        { label: 'B', text: optionB, color: 'bg-blue-500 hover:bg-blue-400', value: 1 },
                                        { label: 'C', text: optionC, color: 'bg-emerald-500 hover:bg-emerald-400', value: 2 },
                                        { label: 'D', text: optionD, color: 'bg-amber-500 hover:bg-amber-400', value: 3 },
                                    ].map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => submitAnswer(opt.value)}
                                            className={`${opt.color} text-white rounded-xl p-6 text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black">{opt.label}</span>
                                                <span>{opt.text}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {gameState === 'SUBMITTED' && (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center shadow-sm w-full">
                                    <div className="text-4xl mb-4 animate-bounce">⏳</div>
                                    <p className="text-neutral-600 font-medium text-lg">Answer locked in!</p>
                                    <p className="text-neutral-400 text-sm mt-2">Waiting for other players...</p>
                                </div>
                            </div>
                        )}
                        
                        {gameState === 'RESULT_CORRECT' && (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="bg-white border border-emerald-200 rounded-xl p-10 text-center shadow-sm w-full">
                                    <div className="text-5xl mb-4">✅</div>
                                    <p className="text-emerald-600 font-bold text-xl mb-2">Correct!</p>
                                    <p className="text-neutral-500">+{currectScore.current} points</p>
                                </div>
                            </div>
                        )}
                        {gameState === 'RESULT_WRONG' && (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="bg-white border border-rose-200 rounded-xl p-10 text-center shadow-sm w-full">
                                    <div className="text-5xl mb-4">❌</div>
                                    <p className="text-rose-600 font-bold text-xl mb-2">Wrong!</p>
                                    <p className="text-neutral-500">Correct answer: {answer}</p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right column - Leaderboard (1/3) */}
                    <div className="col-span-1">
                        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm sticky top-8">
                            <div className="p-4 border-b border-neutral-100">
                                <h2 className="font-bold text-neutral-700 text-center">Leaderboard</h2>
                            </div>

                            <div className="p-4 space-y-2">
                                {leaderboard.map((p, index) => {
                                    const medals = ['🥇', '🥈', '🥉']
                                    const isTop3 = index < 3
                                    
                                    return (
                                        <div key={index} className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                                            index === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-neutral-50'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {isTop3 ? (
                                                    <span className="text-lg">{medals[index]}</span>
                                                ) : (
                                                    <span className="text-neutral-400 font-bold text-sm w-7 text-center">{index + 1}</span>
                                                )}
                                                <p className="text-neutral-800 font-semibold text-sm">
                                                    {p.nickName === nickName ? 'You' : p.nickName}
                                                </p>
                                            </div>
                                            <span className={`font-bold text-sm ${index === 0 ? 'text-amber-600' : 'text-neutral-600'}`}>
                                                {p.score.toLocaleString()}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Your position highlight - if scrolled out of view */}
                            <div className="p-4 border-t border-neutral-100 bg-gradient-to-r from-rose-50 to-orange-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                                            S
                                        </span>
                                        <div>
                                            <p className="text-neutral-800 font-semibold text-sm">You</p>
                                            <p className="text-neutral-400 text-xs">#3rd place</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-rose-500">1,200</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game countdown overlay - shows before first question */}
            {gameState === 'START' && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="text-center">
                        <p className="text-white text-2xl font-medium mb-4">Get Ready!</p>
                        <span className="text-9xl font-black text-white animate-pulse">3</span>
                    </div>
                </div>
            )}

            {/* Final results overlay - shows when game ends */}
            { gameState === 'ENDED' && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-black text-neutral-800 mb-2">Game Over!</h2>
                    <p className="text-neutral-500 mb-8">Final Results</p>
                    
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🥇</span>
                                <span className="font-bold text-neutral-800">Alice</span>
                            </div>
                            <span className="font-bold text-amber-600">4,200</span>
                        </div>
                        <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🥈</span>
                                <span className="font-bold text-neutral-800">Bob</span>
                            </div>
                            <span className="font-bold text-neutral-600">3,600</span>
                        </div>
                        <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🥉</span>
                                <span className="font-bold text-neutral-800">You</span>
                            </div>
                            <span className="font-bold text-neutral-600">2,800</span>
                        </div>
                    </div>

                    <button
                        className="w-full bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white py-4 rounded-xl font-bold text-lg transition"
                        onClick={handleHomeButton}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
            )}
        </div>
    )
}

export default Room;