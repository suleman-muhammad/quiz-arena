package com.quizarena.dto;

import java.util.List;

import com.quizarena.game.Player;
import com.quizarena.game.RoomState;

public class RoomInfo {
    
    private String roomCode;
    private List<Player> players;
    private RoomState state;

    
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

    
}
