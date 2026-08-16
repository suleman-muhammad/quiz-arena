package com.quizarena.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.dto.RoomInfo;
import com.quizarena.entity.Quiz;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;

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

    @GetMapping("{roomCode}/quiz")
    public ResponseEntity<Long> getRoomQuiz(@PathVariable String roomCode){

        GameRoom room = gameManager.findRoomByCode(roomCode);
        if(room == null){
            return ResponseEntity.notFound().build();
        }
        long quizId = room.getQuizId();
        return ResponseEntity.ok(quizId);
        
    }

}
