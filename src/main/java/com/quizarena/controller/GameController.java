package com.quizarena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestBody;

import com.quizarena.dto.AnswerDTO;
import com.quizarena.dto.CreateRoomRequest;
import com.quizarena.dto.JoinRequestAnswer;
import com.quizarena.dto.JoinRoomRequest;
import com.quizarena.dto.LeaveRoomRequest;
import com.quizarena.dto.RoomInfo;
import com.quizarena.dto.StartRoomRequest;
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

    @MessageMapping("/game/create")
    public void createRoom(CreateRoomRequest request){
        GameRoom room = manager.createRoom(request.quizId(), request.hostNickName());
        // messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),room);
        // System.out.println("SERVER: Create ROOM Hit: " + request.quizId() + " , Room Code: " + room.getRoomCode());
        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        messagingTemplate.convertAndSend(
            "/topic/host/" + request.hostNickName(), 
            roomInfo
        );
        
    }

    @MessageMapping("/game/join")
    public void joinRoom(JoinRoomRequest request){
        JoinRequestAnswer requestAnswer = manager.addPlayerToRoom(request.roomCode(), request.playerNickName());

        if(requestAnswer.roomInfo() == null){
            messagingTemplate.convertAndSend("/topic/join_request/" + request.playerNickName() + "/" + request.requestId(), requestAnswer.message());
            return;
        }
        
        messagingTemplate.convertAndSend("/topic/room/" + request.roomCode(),requestAnswer.roomInfo());
        
        // System.out.println("SERVER: Join ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }

    @MessageMapping("/game/leave")
    public void leaveRoom(LeaveRoomRequest request){
        GameRoom room = manager.removePlayerFromRoom(request.roomCode(), request.playerNickName());
        
        if(room != null){
            RoomInfo roomInfo = new RoomInfo();
            roomInfo.setPlayers(room.getPlayers());
            roomInfo.setRoomCode(room.getRoomCode());
            roomInfo.setState(room.getState());
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),roomInfo);
            messagingTemplate.convertAndSend("/topic/player/" + request.playerNickName(), "Out of the ROOM.");
            
        }
        //  System.out.println("SERVER: Leave ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }


    @MessageMapping("/game/start")
    public void startRoom(@RequestBody StartRoomRequest request){
        // System.out.println("SERVER: Start ROOM Hit: " + request.getRoomCode());

        gameService.startRoom(request.getRoomCode());
    }

    @MessageMapping("/game/answer")
    public void handleAnswer(@RequestBody AnswerDTO answer){
        System.out.println("Controller: Got an Answer Submission.");
        gameService.handleAnswer(answer.getRoomCode(),answer);
    }
}
