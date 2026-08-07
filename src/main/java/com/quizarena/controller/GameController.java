package com.quizarena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.quizarena.dto.AnswerDTO;
import com.quizarena.dto.CreateRoomRequest;
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
        System.out.println("SERVER: Create ROOM Hit: " + request.quizId() + " , Room Code: " + room.getRoomCode());
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
        GameRoom room = manager.addPlayerToRoom(request.roomCode(),request.playerNickName());
        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        if(room != null){
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),roomInfo);
        }
        System.out.println("SERVER: Join ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }

    @MessageMapping("/game/leave")
    public void leaveRoom(LeaveRoomRequest request){
        GameRoom room = manager.removePlayerFromRoom(request.roomCode(), request.playerNickName());
        RoomInfo roomInfo = new RoomInfo();
        roomInfo.setPlayers(room.getPlayers());
        roomInfo.setRoomCode(room.getRoomCode());
        roomInfo.setState(room.getState());
        if(room != null){
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),roomInfo);
        }
         System.out.println("SERVER: Leave ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }


    @MessageMapping("/game/start")
    public void startRoom(@RequestBody StartRoomRequest request){
        System.out.println("SERVER: Start ROOM Hit: " + request.getRoomCode());

        gameService.startRoom(request.getRoomCode());
    }

    @MessageMapping("/game/answer")
    public void handleAnswer(@RequestBody AnswerDTO answer){
        gameService.handleAnswer(answer.getRoomCode(),answer);
    }
}
