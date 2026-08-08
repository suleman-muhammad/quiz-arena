package com.quizarena.service;



import java.util.List;

import java.util.Optional;


import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.quizarena.dto.QuestionDTO;
import com.quizarena.dto.StopAcceptingAnswers;
import com.quizarena.dto.AnswerDTO;
import com.quizarena.entity.Quiz;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.game.Player;
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


    public void startRoom(String roomCode){
        System.out.println("Game Service: Starting the Room " + roomCode);

        GameRoom room = manager.findRoomByCode(roomCode);
        if(room == null){
            System.out.println("Game Service: No Room Found with Code " + roomCode);
            return;
        }

        System.out.println("Game Service: Passed the Room check for Room " + roomCode);

        Optional<Quiz> q = quizRepository.findById(room.getQuizId());

        if(!q.isPresent()){
            System.out.println("Game Service: No Quiz Found with Code " + room.getQuizId());
            messagingTemplate.convertAndSend("/topic/room/" + roomCode,"No Quiz Found with id " + room.getQuizId() + " Room ended.");
            return;
        }


        System.out.println("Game Service: Passed quiz check for the Room  " + roomCode);

        room.startRoom(q.get().getQuestions());

        System.out.println("Game Service: Passed statring checks for the Room  " + roomCode);

        this.roomThread.schedule(() -> {
            try{
                this.sendQuestion(room);
            }catch (Exception e){
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);
        
        System.out.println("Server: Scheduled Next Task.");
    
    }

    public void sendQuestion(GameRoom room){
        if(room == null){
            return;
        }

        QuestionDTO currQuestion;
        StopAcceptingAnswers stopAcceptingAnswers = new StopAcceptingAnswers(); 

        currQuestion = room.getNextQuestion();
        if(currQuestion == null){
            return;
        }

        System.out.println("Server: Got a Question: " + currQuestion.getQuestionText());

        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),currQuestion);

        System.out.println("Server: send the  Question Succeccfully" );

        stopAcceptingAnswers.setAccepting(false);
        stopAcceptingAnswers.setQuestionNo(currQuestion.getQuestionNo());

        this.roomThread.schedule(() -> {
            try{
                this.endRound(room,stopAcceptingAnswers);
            }catch (Exception e){
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
            
        }, currQuestion.getTimeLimit(), TimeUnit.SECONDS);

        System.out.println("Server: Scheduled Next Task.");

    }

    public void endRound(GameRoom room,StopAcceptingAnswers stopAcceptingAnswers){

        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), stopAcceptingAnswers);

        System.out.println("Server: Send the  Stop Question Request Succeccfully");

        List<Player> roundResult = room.finishRound();

        System.out.println("Server: Got Round Result.");

        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), roundResult);


        this.roomThread.schedule(() -> {
            try{
                this.sendQuestion(room);
            }catch (Exception e){
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);

        System.out.println("Server: Scheduled Next Task.");


    }

    public void handleAnswer(String roomCode,AnswerDTO answer){
        GameRoom room = manager.findRoomByCode(roomCode);
        if(room != null){
            room.submitAnswer(answer);
        }
    }
}
