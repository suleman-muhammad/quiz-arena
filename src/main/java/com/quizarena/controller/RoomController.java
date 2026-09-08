package com.quizarena.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.dto.response.RoomInfoDTO;
import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.game.Player;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    
    private final GameManager gameManager;

    RoomController(GameManager manager){
        this.gameManager = manager;
    }

    @GetMapping("/{roomCode}")
    public RoomInfoDTO getRoomInfo(@PathVariable String roomCode){
        if(roomCode == null){
            return null;
        }

        GameRoom room = this.gameManager.findRoomByCode(roomCode);
        if(room == null){
            return null;
        }

        RoomInfoDTO info = new RoomInfoDTO();
        info.setPlayers(room.getPlayers());
        info.setRoomCode(roomCode);
        info.setState(room.getState());
        info.setQuizId(room.getQuizId());
        
        return info;

    }

    @GetMapping("/{roomCode}/quiz")
    public ResponseEntity<Long> getRoomQuiz(@PathVariable String roomCode){
        GameRoom room = gameManager.findRoomByCode(roomCode);
        if(room == null){
            return ResponseEntity.notFound().build();
        }

        long quizId = room.getQuizId();
        return ResponseEntity.ok(quizId);
        
    }

    @GetMapping("/{roomCode}/leaderboard")
    public ResponseEntity<List<Player>> getLeaderBoard(@PathVariable String roomCode){
        GameRoom room = gameManager.findRoomByCode(roomCode);
        if(room == null){
            return ResponseEntity.notFound().build();
        }

        List<Player> players = room.getPlayers();
        return ResponseEntity.ok(players);
    }
}
