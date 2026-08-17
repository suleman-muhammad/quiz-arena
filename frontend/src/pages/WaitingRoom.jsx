import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'


function WaitingRoom(){

    const navigate = useNavigate()

    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname')
    const isHost = searchParams.get('host') === 'true'
    const isHostPlaying = searchParams.get('playing') === 'true'

    const [connected, setConnected] = useState(true)
    
    const [players, setPlayers] = useState([])
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)

    const quotes = [
        "Knowledge is power. — Francis Bacon",
        "The more you know, the more you realize you don't know. — Aristotle",
        "It does not matter how slowly you go as long as you do not stop. — Confucius",
        "The only true wisdom is in knowing you know nothing. — Socrates",
        "An investment in knowledge pays the best interest. — Benjamin Franklin",
        "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
        "Tell me and I forget. Teach me and I remember. — Benjamin Franklin",
        "The expert in anything was once a beginner. — Helen Hayes"
    ]

    const [quoteIndex] = useState(Math.floor(Math.random() * quotes.length))

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

    },[])

    const socket = new SockJS('http://localhost:8080/ws')
    const client = Stomp.over(socket)
    client.debug = null
    client.connect({},() =>{
        client.subscribe(`/topic/room/waiting/${roomCode}`, (msg) =>{
            const data = JSON.parse(msg.body)
            console.log(data)
            setPlayers(data.players)
        })
        client.subscribe(`/topic/player/${nickName}`, (msg) =>{
            const data = JSON.parse(msg.body)
            setMyMsgs(data.message)
        })
        client.subscribe(`/topic/room/waiting/start/${roomCode}`, (msg)=>{
            client.disconnect()
            navigate(`/room/${roomCode}?nickname=${nickName}`)
        })
    })

    function startGame(){
        if(!connected){
            setMyMsgs("Not Connected to server. Try Refreshing.")
            return;
        }
        setMyMsgs('')
        client.connect({},() => {
            client.send("/app/game/room/start", JSON.stringify({
                roomCode : roomCode,
                hostNickName: nickName
            }))
        })
    }

    


    return (
        <div className="max-w-5xl mx-auto p-8 mt-8">
            {/* Top bar - Room code + Connection status */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">Room Code</p>
                    <h1 className="text-4xl font-bold text-neutral-800 tracking-widest font-mono">{roomCode}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                    <span className="text-neutral-500 text-sm">{connected ? 'Connected' : 'Connecting...'}</span>
                </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-3 gap-8">
                
                {/* Left column - Quiz info + Motivation */}
                <div className="col-span-1 space-y-6">
                    {/* Quiz card */}
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-xl p-6">
                        <span className="bg-white text-rose-500 text-xs font-semibold px-3 py-1 rounded-full border border-rose-200">
                            {questionCount || '?'} Questions
                        </span>
                        <h3 className="font-bold text-neutral-800 text-lg mt-3">{quizTitle || 'Loading...'}</h3>
                        <p className="text-neutral-500 text-sm mt-2">{quizDescription || ''}</p>
                    </div>

                    {/* Quote */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <p className="text-neutral-400 italic text-sm leading-relaxed">"{quotes[quoteIndex]}"</p>
                    </div>

                    {/* Waiting message */}
                    <div className="bg-neutral-100 rounded-xl p-6">
                        <p className="text-neutral-600 font-medium text-lg mb-1">
                            {isHost ? 'You\'re the host 👑' : 'You\'re in! 🎯'}
                        </p>
                        <p className="text-neutral-400 text-sm">
                            {isHost ? 'Start when everyone has joined.' : 'Waiting for the host to start...'}
                        </p>
                    </div>
                </div>

                {/* Right column - Players + Start */}
                <div className="col-span-2">
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-neutral-700">Players</h2>
                            <span className="bg-neutral-100 text-neutral-600 text-sm font-semibold px-3 py-1 rounded-full">
                                {players.length} joined
                            </span>
                        </div>

                        {players.length === 0 ? (
                            <p className="text-neutral-400 text-center py-12">Waiting for players to join...</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {players.map((p, index) => (
                                    <div key={index} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3 hover:bg-neutral-100 transition">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                                                {p.nickName?.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="text-neutral-700 font-medium">{p.nickName}</span>
                                        </div>
                                        {index === 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">Host</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Start button - host only */}
                    {isHost && (
                        <button
                            onClick={startGame} 
                            disabled={players.length < 2}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                                players.length < 2
                                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white'
                            }`}
                        >
                            {players.length < 2 ? 'Need at least 2 players' : 'Start Game 🚀'}
                        </button>
                    )}
                </div>
            </div>
            {myMsgs && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
                        <p className="text-neutral-800 font-medium text-lg mb-6">{myMsgs}</p>
                        <button
                            onClick={() => setMyMsgs('')}
                            className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white px-8 py-3 rounded-lg font-semibold transition"
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