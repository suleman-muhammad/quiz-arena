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

import com.quizarena.dto.*;
import com.quizarena.game.*;
import com.quizarena.entity.Quiz;
import com.quizarena.repository.QuizRepository;

@Service
public class GameService {
    private GameManager manager;
    private QuizRepository quizRepository;
    private SimpMessagingTemplate messagingTemplate;

    private ScheduledExecutorService roomThread;

    @Autowired
    public GameService(GameManager manager, QuizRepository quizRepository, SimpMessagingTemplate template) {
        this.manager = manager;
        this.quizRepository = quizRepository;
        this.messagingTemplate = template;
        this.roomThread = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors() * 2);
    }

    public void startRoom(StartRoomRequest request) {
        String roomCode = request.roomCode();

        GameRoom room = manager.findRoomByCode(roomCode);
        if (room == null) {
            return;
        }

        if (room.getState() != RoomState.WAITING) {
            messagingTemplate.convertAndSend("/topic/hosts/" + request.hostNickName(),
                    new SimpleMessage("ERROR", "ROOM is already Started."));
            return;
        }

        if (!room.getHost().equalsIgnoreCase(request.hostNickName())) {
            messagingTemplate.convertAndSend("/topic/hosts/" + request.hostNickName(),
                    new SimpleMessage("ERROR", "You are not the Host of the ROOM so cannot start."));
            return;
        }

        messagingTemplate.convertAndSend("/topic/rooms/" + roomCode + "/start", ResponseEntity.ok("let's Go"));
        Optional<Quiz> q = quizRepository.findById(room.getQuizId());

        if (!q.isPresent()) {
            messagingTemplate.convertAndSend("/topic/rooms/" + roomCode + "/waiting",
                    new SimpleMessage("ERROR", "No Quiz Found with id " + room.getQuizId()));
            manager.removeRoom(roomCode);
            return;
        }

        boolean result = room.startRoom(q.get().getQuestions());
        if (!result) {
            messagingTemplate.convertAndSend("/topic/hosts/" + request.hostNickName(),
                    new SimpleMessage("ERROR", "ROOM is already Started."));
            return;
        }
    
        this.roomThread.schedule(() -> {
            try {
                this.sendQuestionText(room);
            } catch (Exception e) {
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);

    }

    public void sendQuestionText(GameRoom room) {
        if (room == null) {
            return;
        }

        QuestionDTO currQuestion;
        StopAcceptingAnswers stopAcceptingAnswers;

        currQuestion = room.getNextQuestion();
        if (currQuestion == null) {
            messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/end",
                    new SimpleMessage("GAME_OVER", "ROOM Ended."));
            manager.removeRoom(room.getRoomCode());
            return;
        }

        QuestionTextDTO questionTextDTO = new QuestionTextDTO(currQuestion.getQuestionText(),
                currQuestion.getQuestionNo());
        messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/question/text", questionTextDTO);

        stopAcceptingAnswers = new StopAcceptingAnswers(currQuestion.getQuestionNo(),
                room.getRightAnswer(currQuestion.getQuestionNo() - 1));

        this.roomThread.schedule(() -> {
            try {
                this.sendQuestionOptions(room, currQuestion, stopAcceptingAnswers);
            } catch (Exception e) {
                System.err.println("Sever: in Sending Question options.");
                e.printStackTrace();
            }

        }, 5, TimeUnit.SECONDS);

    }

    public void sendQuestionOptions(GameRoom room, QuestionDTO questionDTO, StopAcceptingAnswers stopAcceptingAnswers) {
        if (room == null) {
            return;
        }

        messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/question/options", questionDTO);
        room.setPreviousQuestionSentTimeMillis(System.currentTimeMillis());

        this.roomThread.schedule(() -> {
            try {
                this.endRound(room, stopAcceptingAnswers);
            } catch (Exception e) {
                System.err.println("Sever: in Sending Stop request.");
                e.printStackTrace();
            }

        }, questionDTO.getTimeLimit(), TimeUnit.SECONDS);

    }

    public void endRound(GameRoom room, StopAcceptingAnswers stopAcceptingAnswers) {

        messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/question/stop",
                stopAcceptingAnswers);

        this.roomThread.schedule(() -> {
            try {
                this.sendLeaderBoard(room);
            } catch (Exception e) {
                System.err.println("Sever: in Sending LeaderBoard.");
                e.printStackTrace();
            }
        }, 5, TimeUnit.SECONDS);

    }

    public void sendLeaderBoard(GameRoom room) {
        List<Player> roundResult = room.finishRound();

        messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/leaderboard", roundResult);
        if (room.hasFinished()) {
            messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/end",
                    new SimpleMessage("GAME_OVER", "ROOM Ended."));
            manager.removeRoom(room.getRoomCode());
            return;
        }

        this.roomThread.schedule(() -> {
            try {
                this.sendQuestionText(room);
            } catch (Exception e) {
                System.err.println("Sever: in Send next Question.");
                e.printStackTrace();
            }
        }, 10, TimeUnit.SECONDS);
    }

    public void handleAnswer(String roomCode, AnswerDTO answer) {
        GameRoom room = manager.findRoomByCode(roomCode);
        if (room != null) {
            int result = room.submitAnswer(answer);
            PlayerInfoDTO playerInfoDTO = new PlayerInfoDTO("SCORES", Integer.valueOf(result));
            messagingTemplate.convertAndSend("/topic/rooms/" + roomCode + "/players/" + answer.getPlayerNickName(),
                    playerInfoDTO);
        }
    }

    public void handleRemovePlayer(LeaveRoomRequest request) {
        if (!manager.roomExists(request.roomCode())) {
            return;
        }

        GameRoom room = manager.findRoomByCode(request.roomCode());

        String roomEndPoint;
        if (room.getState() == RoomState.WAITING) {
            roomEndPoint = "/topic/rooms/" + room.getRoomCode() + "/waiting";
        } else {
            roomEndPoint = "/topic/rooms/" + room.getRoomCode() + "/roster";
        }

        Player p = new Player();
        p.setNickName(request.playerNickName());
        room.removePlayer(p);

        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        roomInfo.setQuizId(room.getQuizId());

        messagingTemplate.convertAndSend(roomEndPoint, roomInfo);
        messagingTemplate.convertAndSend("/topic/rooms/" + room.getRoomCode() + "/players/" + request.playerNickName(),
                new SimpleMessage("INFO", "Out of the ROOM."));
    }
}
