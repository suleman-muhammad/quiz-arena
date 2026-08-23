package com.quizarena.service;



import java.util.List;

import java.util.Optional;


import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.quizarena.dto.QuestionDTO;
import com.quizarena.dto.QuestionTextDTO;
import com.quizarena.dto.RoomInfo;
import com.quizarena.dto.StopAcceptingAnswers;
import com.quizarena.dto.AnswerDTO;
import com.quizarena.dto.SimpleMessage;
import com.quizarena.dto.StartRoomRequest;
import com.quizarena.dto.LeaveRoomRequest;
import com.quizarena.entity.Quiz;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.game.Player;
import com.quizarena.game.RoomState;
import com.quizarena.repository.QuizRepository;

@Service
public class GameService {
    private GameManager manager;
    private QuizRepository quizRepository;
    private SimpMessagingTemplate messagingTemplate;

    private ScheduledExecutorService roomThread;

    @Autowired
    public GameService(GameManager manager,QuizRepository quizRepository, SimpMessagingTemplate template){
        this.manager = manager;
        this.quizRepository = quizRepository;
        this.messagingTemplate = template;
        this.roomThread = Executors.newScheduledThreadPool(1);
    }


    public void startRoom(StartRoomRequest request){
        String roomCode = request.roomCode();
        System.out.println("Game Service: Starting the Room " + roomCode);

        GameRoom room = manager.findRoomByCode(roomCode);
        if(room == null){
            System.out.println("Game Service: No Room Found with Code " + roomCode);
            return;
        }

        if(room.getState() != RoomState.WAITING){
            messagingTemplate.convertAndSend("/topic/host/" + request.hostNickName(), new SimpleMessage("ERROR","ROOM is already Started."));
            return;
        }

        if(!room.getHost().equalsIgnoreCase(request.hostNickName())){
            messagingTemplate.convertAndSend("/topic/host/" + request.hostNickName(), new SimpleMessage("ERROR","You are not the Host of the ROOM so cannot start."));
            return;
        }

        // System.out.println("Game Service: Passed the Room check for Room " + roomCode);

        messagingTemplate.convertAndSend("/topic/room/waiting/start/" + roomCode, ResponseEntity.ok("let's Go"));
        Optional<Quiz> q = quizRepository.findById(room.getQuizId());

        if(!q.isPresent()){
            // System.out.println("Game Service: No Quiz Found with Code " + room.getQuizId());
            messagingTemplate.convertAndSend("/topic/room/waiting" + roomCode, new SimpleMessage("ERROR","No Quiz Found with id " + room.getQuizId()));
            manager.removeRoom(roomCode);
            return;
        }


        // System.out.println("Game Service: Passed quiz check for the Room  " + roomCode);

        room.startRoom(q.get().getQuestions());

        // System.out.println("Game Service: Passed statring checks for the Room  " + roomCode);

        this.roomThread.schedule(() -> {
            try{
                this.sendQuestionText(room);
            }catch (Exception e){
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);
        
        // System.out.println("Server: Scheduled Next Task.");
    
    }

    public void sendQuestionText(GameRoom room){
        // System.out.println("Server: entered Send Question.");
        if(room == null){
            return;
        }

        QuestionDTO currQuestion;
        StopAcceptingAnswers stopAcceptingAnswers;

        currQuestion = room.getNextQuestion();
        if(currQuestion == null){
            // System.out.println("Server: current Question is NUll to returning.");
            messagingTemplate.convertAndSend("/topic/room/end/" + room.getRoomCode(),new SimpleMessage("GAME_OVER","ROOM Ended."));
            manager.removeRoom(room.getRoomCode());
            return;
        }

        // System.out.println("Server: Got a Question: " + currQuestion.getQuestionText());

        QuestionTextDTO questionTextDTO = new QuestionTextDTO(currQuestion.getQuestionText(),currQuestion.getQuestionNo());
        messagingTemplate.convertAndSend("/topic/room/play/question/text/" + room.getRoomCode(),questionTextDTO);

        // System.out.println("Server: send the  Question Succeccfully" );

        stopAcceptingAnswers = new StopAcceptingAnswers(currQuestion.getQuestionNo(),room.getRightAnswer(currQuestion.getQuestionNo()-1));

        this.roomThread.schedule(() -> {
            try{
                this.sendQuestionOptions(room, currQuestion, stopAcceptingAnswers);
            }catch (Exception e){
                System.err.println("Sever: in Sending Question options.");
                e.printStackTrace();
            }
            
        }, 5, TimeUnit.SECONDS);

        // System.out.println("Server: Scheduled Next Task.");

    }

    public void sendQuestionOptions(GameRoom room,QuestionDTO questionDTO, StopAcceptingAnswers stopAcceptingAnswers){
        if(room == null){
            return;
        }


        messagingTemplate.convertAndSend("/topic/room/play/question/options/" + room.getRoomCode(),questionDTO);
        room.setPreviousQuestionSentTimeMillis(System.currentTimeMillis());

        this.roomThread.schedule(() -> {
            try{
                this.endRound(room,stopAcceptingAnswers);
            }catch (Exception e){
                System.err.println("Sever: in Sending Stop request.");
                e.printStackTrace();
            }
            
        }, questionDTO.getTimeLimit(), TimeUnit.SECONDS);


    }

    public void endRound(GameRoom room,StopAcceptingAnswers stopAcceptingAnswers){

        messagingTemplate.convertAndSend("/topic/room/play/question/stop/" + room.getRoomCode(), stopAcceptingAnswers);

        // System.out.println("Server: Send the  Stop Question Request Succeccfully");

        this.roomThread.schedule(() -> {
            try{
                this.sendLeaderBoard(room);
            }catch (Exception e){
                System.err.println("Sever: in Sending LeaderBoard.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);

        // System.out.println("Server: Scheduled Next Task.");


    }

    public void sendLeaderBoard(GameRoom room){
        List<Player> roundResult = room.finishRound();

        // System.out.println("Server: Got Round Result.");

        messagingTemplate.convertAndSend("/topic/room/play/leaderboard/" + room.getRoomCode(), roundResult);
        this.roomThread.schedule(() -> {
            try{
                this.sendQuestionText(room);
            }catch (Exception e){
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 10, TimeUnit.SECONDS);
    }

    public void handleAnswer(String roomCode,AnswerDTO answer){
        System.out.println("Service: Got an Answer Submission.");
        GameRoom room = manager.findRoomByCode(roomCode);
        if(room != null){
            int result = room.submitAnswer(answer);  
            messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/player/" + answer.getPlayerNickName() + "/scores",result);
        }
    }

    public void handleRemovePlayer(LeaveRoomRequest request){
        if(!manager.roomExists(request.roomCode())){
            return;
        }

        GameRoom room = manager.findRoomByCode(request.roomCode());

        String roomEndPoint;
        if(room.getState() == RoomState.WAITING){
            roomEndPoint = "/topic/room/waiting/";
        }else{
            roomEndPoint = "/topic/room/update/";
        }

        // if(request.playerNickName().equalsIgnoreCase(room.getHost())){
        //     messagingTemplate.convertAndSend("/topic/player/" + request.playerNickName(), new SimpleMessage("INFO","Out of the ROOM."));
        //     messagingTemplate.convertAndSend(roomEndPoint + "end/" + room.getRoomCode(),new SimpleMessage("GAME_OVER","Host Disconnected."));
        //     manager.removeRoom(room.getRoomCode());
        //     return;
        // }

        Player p = new Player();
        p.setNickName(request.playerNickName());
        room.removePlayer(p);

        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        messagingTemplate.convertAndSend(roomEndPoint + room.getRoomCode(),roomInfo);
        messagingTemplate.convertAndSend("/topic/player/" + request.playerNickName(), new SimpleMessage("INFO","Out of the ROOM."));
    }
}
