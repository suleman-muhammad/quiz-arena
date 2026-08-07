package com.quizarena.dto;

public class AnswerDTO {
    private String roomCode;
    private String playerNickName;
    private int questionNo;
    private int choosenOption;
    private int answeredAtMillis;

    public int getQuestionNo() {
        return questionNo;
    }
    public void setQuestionNo(int questionNo) {
        this.questionNo = questionNo;
    }
    public int getChoosenOption() {
        return choosenOption;
    }
    public void setChoosenOption(int choosenOption) {
        this.choosenOption = choosenOption;
    }
    
    public String getPlayerNickName() {
        return playerNickName;
    }
    public void setPlayerNickName(String playerNickName) {
        this.playerNickName = playerNickName;
    }
    public String getRoomCode() {
        return roomCode;
    }
    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }
    public int getAnsweredAtMillis() {
        return answeredAtMillis;
    }
    public void setAnsweredAtMillis(int answeredAtMillis) {
        this.answeredAtMillis = answeredAtMillis;
    }
    

    
}
