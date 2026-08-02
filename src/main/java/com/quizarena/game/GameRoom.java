package com.quizarena.game;
import java.util.ArrayList;
import java.util.List;

public class GameRoom {
    private long quizId;
    private String roomCode;
    private GameState state;
    private List<Player> players;
    private String hostId;
    
    public GameRoom(String code,Long quizId,String hostId){
        this.quizId = quizId;
        this.hostId = hostId;
        this.roomCode = code;
        this.state = GameState.WAITING;
        this.players = new ArrayList<>();
    }


    public void addPlayer(Player p){
        this.players.add(p);
    }

    public boolean removePlayer(Player p){
        return players.remove(p);
    }


    public long getQuizId() {
        return quizId;
    }
    public void setQuizId(long quizId) {
        this.quizId = quizId;
    }
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
    public GameState getState() {
        return state;
    }
    public void setState(GameState state) {
        this.state = state;
    }
    public String getHostId() {
        return hostId;
    }
    public void setHostId(String hostId) {
        this.hostId = hostId;
    }
    
    
}
