package com.quizarena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import com.quizarena.dto.CreateRoomRequest;
import com.quizarena.dto.JoinRoomRequest;
import com.quizarena.dto.LeaveRoomRequest;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.service.GameService;


@Controller
public class GameController {

    private SimpMessagingTemplate messagingTemplate;
    private GameManager manager;
    private GameService gameService;

    public GameController(SimpMessagingTemplate template,GameManager manager){
        this.messagingTemplate = template;
        this.manager = manager;
    }

    @MessageMapping("/game/create")
    public void createRoom(CreateRoomRequest request){
        GameRoom room = manager.createRoom(request.quizId(), request.hostNickName());
        // messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),room);
        System.out.println("SERVER: Create ROOM Hit: " + request.quizId() + " , Room Code: " + room.getRoomCode());
        messagingTemplate.convertAndSend(
            "/topic/host/" + request.hostNickName(), 
            room
        );
        
    }

    @MessageMapping("/game/join")
    public void joinRoom(JoinRoomRequest request){
        GameRoom room = manager.addPlayerToRoom(request.roomCode(),request.playerNickName());
        if(room != null){
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),room);
        }
        System.out.println("SERVER: Join ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }

    @MessageMapping("/game/leave")
    public void leaveRoom(LeaveRoomRequest request){
        GameRoom room = manager.removePlayerFromRoom(request.roomCode(), request.playerNickName());
        if(room != null){
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),room);
        }
         System.out.println("SERVER: Leave ROOM Hit: " + request.roomCode() + " , Player Name: " + request.playerNickName());
    }


    @MessageMapping("/game/start/{roomCode}")
    public void startRoom(@PathVariable String roomCode){
        gameService.startRoom(roomCode);
    }
}
