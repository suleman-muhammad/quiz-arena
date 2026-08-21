package com.quizarena.game;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.quizarena.dto.AnswerDTO;
import com.quizarena.dto.QuestionDTO;
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
    private Map<AnswerDTO,Integer> answers;
    
    
    public GameRoom(String code,Long quizId,String host){
        this.quizId = quizId;
        this.host = host;
        this.roomCode = code;
        this.state = RoomState.WAITING;

        this.players = new ArrayList<>();
        this.answers = new ConcurrentHashMap<>();

        this.questions = null;
    }


    public void startRoom(List<Question> questions){
        this.questions = questions;
        currQuestionNo = 1;
        this.state = RoomState.In_PROGRESS;
    }

    public QuestionDTO getNextQuestion(){
        if(questions == null || currQuestionNo >= questions.size()){
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
        this.state = RoomState.In_PROGRESS;
        return q;
    }

    public List<Player> finishRound(){
        System.out.println("Game: Got a finish Round Request.");
        Question q = questions.get(currQuestionNo-1);
        for(AnswerDTO ans: answers.keySet()){ 

            System.out.println("Game: Checking answer from " + ans.getPlayerNickName() + 
            " chose=" + ans.getChosenOption() + " correct=" + q.getCorrectOption());

            for (Player p : players){
                if(p.getNickName().equalsIgnoreCase(ans.getPlayerNickName())){
                    System.out.println("Game: Player Matched.");
                    p.setScore(p.getScore() + answers.get(ans));
                    
                }
            }
        }
        this.answers.clear();
        System.out.println("Serivce: Sending LeaderBoard.");
        if(currQuestionNo >= this.questions.size()){
            this.state = RoomState.FINISHED;
        }else{
            this.state = RoomState.BETWEEN_QUESTIONS;
        }
        return this.getLeaderBoard();
    }

    private List<Player> getLeaderBoard(){
        Collections.sort(players,new ComparePlayersForPosition());
        for(int i = 0; i<players.size(); i++){
            players.get(i).setCurrentPos(i+1);
        }
        return players;
    }

    public boolean addPlayer(Player p){
        if(this.state != RoomState.WAITING){
            return false;
        }
        
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

    public int submitAnswer(AnswerDTO answer){
        System.out.println("Game: Got an Answer Submission.");
        synchronized(this.answers){
            if(((answer.getAnsweredAtMillis() - this.previousQuestionSentTimeMillis)/1000) <= questions.get(answer.getQuestionNo()-1).getTimeLimitSeconds()){
                int dScores = calScores(answer);
                this.answers.put(answer,dScores);
                return dScores;
            }
            return 0;
        }
    }

    public int calScores(AnswerDTO ans){
        Question q = questions.get(currQuestionNo-1);
        if(ans.getChosenOption() == q.getCorrectOption()){
            System.out.println("Game: Answer Matched.");
            double n = ((ans.getAnsweredAtMillis()-this.previousQuestionSentTimeMillis)/1000);
            int dScores = (int) Math.ceil(1000 - ((10*n*(n+1))/2));
            return dScores;
        }
        return 0;
    }

    public String getRightAnswer(int questionNo){
        if(questionNo < questions.size()){
            Question q = questions.get(questionNo);
            int correct = q.getCorrectOption();
            return switch (correct) {
                case 0 -> q.getOptionA();
                case 1 -> q.getOptionB();
                case 2 -> q.getOptionC();
                case 3 -> q.getOptionD();
                default -> "unKnown";
            };
        }
        return "unKnown";
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
