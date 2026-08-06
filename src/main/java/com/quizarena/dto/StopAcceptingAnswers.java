package com.quizarena.dto;

public class StopAcceptingAnswers {
    
    private int questionNo;
    private boolean isAccepting;
    
    public int getQuestionNo() {
        return questionNo;
    }
    public void setQuestionNo(int questionNo) {
        this.questionNo = questionNo;
    }
    public boolean isAccepting() {
        return isAccepting;
    }
    public void setAccepting(boolean isAccepting) {
        this.isAccepting = isAccepting;
    }

    
}
