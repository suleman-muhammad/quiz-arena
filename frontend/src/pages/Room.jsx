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

    

    return (
        <div>
            <p>You are In the Room</p>
        </div>
    )
}