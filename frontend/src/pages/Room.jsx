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
            client.subscribe(`/topic/room/play/leaderboard/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)
            })
            client.subscribe(`/topic/room/play/question/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)
            })
        })
        return () => {
            if (stompClient.current) stompClient.current.disconnect()
        }
    },[])

    

    function handleAnswerClick(){

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
        </div>
    )
}

export default Room;