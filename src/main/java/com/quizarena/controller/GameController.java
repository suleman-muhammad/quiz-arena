package com.quizarena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestBody;

import com.quizarena.dto.request.SubmitAnswerRequest;
import com.quizarena.dto.response.JoinRequestResponse;
import com.quizarena.dto.response.RoomInfoDTO;
import com.quizarena.dto.request.CreateRoomRequest;
import com.quizarena.dto.request.JoinRoomRequest;
import com.quizarena.dto.request.LeaveRoomRequest;
import com.quizarena.dto.request.StartRoomRequest;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.service.GameService;

@Controller
public class GameController {

    private SimpMessagingTemplate messagingTemplate;
    private GameManager manager;
    private GameService gameService;

    public GameController(SimpMessagingTemplate template,GameManager manager,GameService service){
        this.messagingTemplate = template;
        this.gameService = service;
        this.manager = manager;
    }

    @MessageMapping("/game/rooms/create")
    public void createRoom(CreateRoomRequest request){
        GameRoom room = manager.createRoom(request);

        RoomInfoDTO roomInfo = new RoomInfoDTO();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        roomInfo.setQuizId(room.getQuizId());

        messagingTemplate.convertAndSend(
            "/topic/hosts/" + request.hostNickName(), 
            roomInfo
        );
        
    }

    @MessageMapping("/game/rooms/join")
    public void joinRoom(JoinRoomRequest request){    
        JoinRequestResponse requestAnswer = manager.addPlayerToRoom(request.roomCode(), request.playerNickName());

        messagingTemplate.convertAndSend("/topic/join-requests/" + request.playerNickName() + "/" + request.requestId(), requestAnswer);
        messagingTemplate.convertAndSend("/topic/rooms/" + request.roomCode() + "/waiting", requestAnswer.roomInfo());
        
    }

    @MessageMapping("/game/rooms/leave")
    public void leaveRoom(LeaveRoomRequest request){
        gameService.handleRemovePlayer(request);
    }


    @MessageMapping("/game/rooms/start")
    public void startRoom(@RequestBody StartRoomRequest request){
        gameService.startRoom(request);
    }

    @MessageMapping("/game/rooms/answer")
    public void handleAnswer(@RequestBody SubmitAnswerRequest answer){
        gameService.handleAnswer(answer.getRoomCode(),answer);
    }
}
