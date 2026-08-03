package com.quizarena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.quizarena.dto.CreateRoomRequest;
import com.quizarena.dto.JoinRoomRequest;
import com.quizarena.dto.LeaveRoomRequest;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;


@Controller
public class GameController {

    private SimpMessagingTemplate messagingTemplate;
    private GameManager manager;

    public GameController(SimpMessagingTemplate template,GameManager manager){
        this.messagingTemplate = template;
        this.manager = manager;
    }

    @MessageMapping("/game/create")
    public void createRoom(CreateRoomRequest request){
        GameRoom room = manager.createRoom(request.quizId(), request.hostNickName());
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),room);
    }

    @MessageMapping("/game/join")
    public void joinRoom(JoinRoomRequest request){
        GameRoom room = manager.addPlayerToRoom(request.roomCode(),request.playerNickName());
        if(room != null){
            messagingTemplate.convertAndSend("topic/room/" + room.getRoomCode(),room);
        }
    }

    @MessageMapping("/game/leave")
    public void leaveRoom(LeaveRoomRequest request){
        GameRoom room = manager.removePlayerFromRoom(request.roomCode(), request.playerNickName());
        
    }
}
