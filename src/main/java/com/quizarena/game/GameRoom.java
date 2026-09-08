package com.quizarena.game;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.quizarena.dto.request.SubmitAnswerRequest;
import com.quizarena.dto.event.QuestionOptionsDTO;
import com.quizarena.entity.Question;

public class GameRoom {
    private long quizId;
    private String roomCode;
    private RoomState state;
    private String host;
    private int currQuestionNo;
    private long previousQuestionSentTimeMillis;

    private List<Player> players;
    private List<Question> questions;
    private Map<String,Integer> answers;
    
    
    public GameRoom(String code,Long quizId,String host){
        this.quizId = quizId;
        this.host = host;
        this.roomCode = code;
        this.state = RoomState.WAITING;

        this.players = new ArrayList<>();
        this.answers = new ConcurrentHashMap<>();
        this.questions = null;
    }


    public synchronized boolean startRoom(List<Question> questions){
        if(this.state != RoomState.WAITING){
            return false;
        }

        this.questions = questions;
        currQuestionNo = 0;
        this.state = RoomState.In_PROGRESS;
        return true;
    }

    public QuestionOptionsDTO getNextQuestion(){
        if(questions == null || currQuestionNo >= questions.size()){
            return null;
        }

        Question curr = questions.get(currQuestionNo);

        QuestionOptionsDTO q = new QuestionOptionsDTO();
        q.setQuestionText(curr.getQuestionText());
        q.setOptionA(curr.getOptionA());
        q.setOptionB(curr.getOptionB());
        q.setOptionC(curr.getOptionC());
        q.setOptionD(curr.getOptionD());
        q.setTimeLimit(10);
        q.setQuestionNo(++currQuestionNo);
        
        this.state = RoomState.In_PROGRESS;
        return q;
    }

    public List<Player> finishRound(){
        synchronized(this.answers){
            for(String playerName: answers.keySet()){ 

                for (Player p : players){
                    if(p.getNickName().equalsIgnoreCase(playerName)){
                        p.setScore(p.getScore() + answers.get(playerName));
                        if (answers.get(playerName) > 0){
                            p.setCombo(p.getCombo() + 1);
                        }else{
                            p.setCombo(0);
                        }
                    }
                }
            }

            this.answers.clear();
        }
        
        if(currQuestionNo >= this.questions.size()){
            this.state = RoomState.FINISHED;
        }else{
            this.state = RoomState.BETWEEN_QUESTIONS;
        }
        return this.getLeaderBoard();
    }

    private List<Player> getLeaderBoard(){
        synchronized(this.players){
            Collections.sort(players,new ComparePlayersForPosition());
            for(int i = 0; i<players.size(); i++){
                players.get(i).setCurrentPos(i+1);
            }
            return players;
        }
        
    }

    public boolean addPlayer(Player p){
        if(this.state != RoomState.WAITING){
            return false;
        }
        
        synchronized(this.players){
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
    }

    public boolean removePlayer(Player p){
        synchronized(this.players){
            for(Player player: players){
                if(player.getNickName().equalsIgnoreCase(p.getNickName())){
                    return players.remove(player);
                }
            }
        }
        return false;
    }

    public int submitAnswer(SubmitAnswerRequest submitAnswerRequest){
        synchronized(this.answers){
            if(answers.containsKey(submitAnswerRequest.getPlayerNickName().toLowerCase())){
                return -1;
            }

            if(((submitAnswerRequest.getAnsweredAtMillis() - this.previousQuestionSentTimeMillis)/1000) <= questions.get(submitAnswerRequest.getQuestionNo()-1).getTimeLimitSeconds()){
                int dScores = calculateScores(submitAnswerRequest);

                this.answers.put(submitAnswerRequest.getPlayerNickName().toLowerCase(),dScores);
                return dScores;
            }
            return 0;
        }
    }

    public int calculateScores(SubmitAnswerRequest ans){
        Question q = questions.get(currQuestionNo-1);
        if(ans.getChosenOption() == q.getCorrectOption()){
            double n = ((ans.getAnsweredAtMillis()-this.previousQuestionSentTimeMillis)/1000);
            int dScores = (int) Math.ceil(1000 - ((10*n*(n+1))/2));
            return dScores;
        }
        return 0;
    }

    public String getCorrectAnswer(int questionNo){
        if(questionNo < questions.size()){
            Question q = questions.get(questionNo);
            int correct = q.getCorrectOption();
            return switch (correct) {
                case 0 -> q.getOptionA();
                case 1 -> q.getOptionB();
                case 2 -> q.getOptionC();
                case 3 -> q.getOptionD();
                default -> "unknown";
            };
        }
        return "unKnown";
    }

    public boolean hasFinished(){
        return this.currQuestionNo >= this.questions.size();
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

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getCurrQuestionNo() {
        return currQuestionNo;
    }


    public void setCurrQuestionNo(int currQuestionNo) {
        this.currQuestionNo = currQuestionNo;
    }


    public long getPreviousQuestionSentTimeMillis() {
        return previousQuestionSentTimeMillis;
    }


    public void setPreviousQuestionSentTimeMillis(long previousQuestionSentTimeMillis) {
        this.previousQuestionSentTimeMillis = previousQuestionSentTimeMillis;
    }
   
}
