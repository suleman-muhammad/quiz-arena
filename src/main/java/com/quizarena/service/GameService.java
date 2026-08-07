package com.quizarena.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
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
import com.quizarena.repository.QuizRepository;

@Service
public class GameService {
    private GameManager manager;
    private QuizRepository quizRepository;
    private SimpMessagingTemplate messagingTemplate;
    private Map<String,List<AnswerDTO>> roomAnswers;

    @Autowired
    public GameService(GameManager manager,QuizRepository quizRepository, SimpMessagingTemplate template){
        this.manager = manager;
        this.quizRepository = quizRepository;
        this.roomAnswers = new ConcurrentHashMap<>();
        this.messagingTemplate = template;
    }


    public void startRoom(String roomCode){
        System.out.println("Game Service: Starting the Room " + roomCode);
        GameRoom room = manager.findRoomByCode(roomCode);
        if(room == null){
            System.out.println("Game Service: No Room Found with Code " + roomCode);
            return;
        }

        Optional<Quiz> q = quizRepository.findById(room.getQuizId());

        if(!q.isPresent()){
            System.out.println("Game Service: No Quiz Found with Code " + room.getQuizId());
            messagingTemplate.convertAndSend("/topic/room/" + roomCode,"No Quiz Found with id " + room.getQuizId() + " Room ended.");
            return;
        }

        room.startRoom(q.get().getQuestions());
        ExecutorService roomThread = Executors.newSingleThreadScheduledExecutor();
        roomAnswers.put(roomCode, new ArrayList<>());

        roomThread.submit(() -> {  
            QuestionDTO currQuestion;
            StopAcceptingAnswers stopAcceptingAnswers = new StopAcceptingAnswers(); 

            while((currQuestion = room.getNextQuestion()) != null){
    
                try{
                    System.out.println("Game Service: Sending First Question to Room " + roomCode);
                    stopAcceptingAnswers.setQuestionNo(currQuestion.getQuestionNo());
                    stopAcceptingAnswers.setAccepting(false);

                    messagingTemplate.convertAndSend("/topic/room/" + roomCode,currQuestion);

                    Thread.sleep(currQuestion.getTimeLimit()*1000);
                    messagingTemplate.convertAndSend("/topic/room/" + roomCode, stopAcceptingAnswers);
                    room.finishRound(roomAnswers.get(roomCode));
                    roomAnswers.put(roomCode, new ArrayList<>());
                    messagingTemplate.convertAndSend("/topic/room/" + roomCode, room.getLeaderBoard());
                    Thread.sleep(3000);
                }catch (Exception e){
                    System.out.println("Server: Error in Room " + roomCode);
                    e.printStackTrace();
                }

            }
        });
    }

    public void handleAnswer(String roomCode,AnswerDTO answer){
        if(roomAnswers.containsKey(roomCode)){
            roomAnswers.get(roomCode).add(answer);
        }
    }
}
