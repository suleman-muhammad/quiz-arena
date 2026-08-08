package com.quizarena.dto;

public class AnswerDTO {
    private String roomCode;
    private String playerNickName;
    private int questionNo;
    private int chosenOption;
    private long answeredAtMillis;

    public int getQuestionNo() {
        return questionNo;
    }
    public void setQuestionNo(int questionNo) {
        this.questionNo = questionNo;
    }
    public int getChosenOption() {
        return chosenOption;
    }
    public void setChosenOption(int chosenOption) {
        this.chosenOption = chosenOption;
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
    public long getAnsweredAtMillis() {
        return answeredAtMillis;
    }
    public void setAnsweredAtMillis(long answeredAtMillis) {
        this.answeredAtMillis = answeredAtMillis;
    }
    

    
}
