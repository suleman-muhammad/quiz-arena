package com.quizarena.game;
import java.util.ArrayList;
import java.util.List;

import com.quizarena.dto.QuestionDTO;
import com.quizarena.entity.Question;

public class GameRoom {
    private long quizId;
    private String roomCode;
    private GameState state;
    private List<Player> players;
    private String host;
    private List<Question> questions;
    private int currQuestionNo;
    
    public GameRoom(String code,Long quizId,String host){
        this.quizId = quizId;
        this.host = host;
        this.roomCode = code;
        this.state = GameState.WAITING;
        this.players = new ArrayList<>();
        this.questions = null;
    }


    public void startRoom(List<Question> questions){
        this.questions = questions;
        currQuestionNo = 1;
    }

    public QuestionDTO getNextQuestion(){
        if(questions == null || currQuestionNo > questions.size()){
            return null;
        }

        QuestionDTO q = new QuestionDTO();
        Question curr = questions.get(currQuestionNo);
        q.setQuestionText(curr.getQuestionText());
        q.setOptionA(curr.getOptionA());
        q.setOptionB(curr.getOptionB());
        q.setOptionC(curr.getOptionC());
        q.setOptionD(curr.getOptionD());
        q.setTimeLimit(10);
        q.setQuestionNo(currQuestionNo++);
        return q;
    }


    public boolean addPlayer(Player p){
        p.setCurrentPos(1);
        p.setScore(0);
        for(Player player: players){
            if (player.getNickName().equalsIgnoreCase(p.getNickName())){
                return false;
            }
        }

        this.players.add(p);
        return true;
    }

    public boolean removePlayer(Player p){
        for(Player player: players){
            if(player.getNickName().equalsIgnoreCase(p.getNickName())){
                return players.remove(player);
            }
        }
        return false;
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
        return host;
    }
    public void setHostId(String host) {
        this.host = host;
    }
    
    
}
