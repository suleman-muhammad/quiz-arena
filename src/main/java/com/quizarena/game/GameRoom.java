package com.quizarena.game;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.quizarena.dto.AnswerDTO;
import com.quizarena.dto.QuestionDTO;
import com.quizarena.entity.Question;

public class GameRoom {
    private long quizId;
    private String roomCode;
    private RoomState state;
    private String host;
    private int currQuestionNo;

    private List<Player> players;
    private List<Question> questions;
    private List<AnswerDTO> answers;
    
    
    public GameRoom(String code,Long quizId,String host){
        this.quizId = quizId;
        this.host = host;
        this.roomCode = code;
        this.state = RoomState.WAITING;
        this.players = new ArrayList<>();
        this.questions = null;
        this.answers = new ArrayList<>();
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

    public List<Player> finishRound(){
        Question q = questions.get(currQuestionNo-1);
        for(AnswerDTO ans: answers){ 
            for (Player p : players){
                if(p.getNickName().equalsIgnoreCase(ans.getPlayerNickName())){
                    if(ans.getChoosenOption() == q.getCorrectOption()){
                        double n = (ans.getAnsweredAtMillis()/1000);
                        int dScores = (int) Math.ceil(1000 - ((n*(n-1))/2));
                        p.setScore(p.getScore() + dScores);
                    }
                    
                }
            }
        }
        this.answers.clear();
        return this.getLeaderBoard();
    }

    private List<Player> getLeaderBoard(){
        Collections.sort(players,new ComparePlayersForPosition());
        for(int i = 0; i<players.size(); i++){
            players.get(i).setCurrentPos(i+1);
        }
        return players.subList(0, Math.min(5,players.size()));
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

    public void submitAnswer(AnswerDTO answer){
        synchronized(this.answers){
            this.answers.add(answer);
        }
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
    public RoomState getState() {
        return state;
    }
    public void setState(RoomState state) {
        this.state = state;
    }
    public String getHostId() {
        return host;
    }
    public void setHostId(String host) {
        this.host = host;
    }
    
    
}
