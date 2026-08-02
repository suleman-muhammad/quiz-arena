package com.quizarena.game;

public class Player {
    private String id;
    private String nickName;
    private long score;
    private long currentPos;


    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getNickName() {
        return nickName;
    }
    public void setNickName(String nickName) {
        this.nickName = nickName;
    }
    public long getScore() {
        return score;
    }
    public void setScore(long score) {
        this.score = score;
    }
    public long getCurrentPos() {
        return currentPos;
    }
    public void setCurrentPos(long currentPos) {
        this.currentPos = currentPos;
    }


    
}
