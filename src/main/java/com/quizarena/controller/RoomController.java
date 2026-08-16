package com.quizarena.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.dto.RoomInfo;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.service.GameService;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    
    
    private final GameManager gameManager;

    RoomController(GameManager manager){
        this.gameManager = manager;
    }

    @GetMapping("/{roomCode}")
    public RoomInfo getRoomInfo(@PathVariable String roomCode){
        if(roomCode == null){
            return null;
        }

        GameRoom room = this.gameManager.findRoomByCode(roomCode);
        if(room == null){
            return null;
        }
        RoomInfo info = new RoomInfo();
        info.setPlayers(room.getPlayers());
        info.setRoomCode(roomCode);
        info.setState(room.getState());
        return info;

    }

}
