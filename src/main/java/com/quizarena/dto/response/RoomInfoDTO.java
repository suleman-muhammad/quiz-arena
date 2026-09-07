package com.quizarena.dto.response;

import java.util.List;

import com.quizarena.game.Player;
import com.quizarena.game.RoomState;

public class RoomInfoDTO {
    
    private String roomCode;
    private List<Player> players;
    private RoomState state;
    private long quizId;

    
    public String getRoomCode() {
        return roomCode;
    }
    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }
    public List<Player> getPlayers() {
        return players;
    }
    public void setPlayers(List<Player> players) {
        this.players = players;
    }
    public RoomState getState() {
        return state;
    }
    public void setState(RoomState state) {
        this.state = state;
    }
    public long getQuizId() {
        return quizId;
    }
    public void setQuizId(long quizId) {
        this.quizId = quizId;
    } 
}
