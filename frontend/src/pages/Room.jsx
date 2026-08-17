import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'

function Room(){

    const [roomCode] = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname')

    const [connected, setConnected] = useState(true)
    
    const [players, setPlayers] = useState([])
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)


    

    

    return (
        <div>
            <p>You are In the Room</p>
        </div>
    )
}