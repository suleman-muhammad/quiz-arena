package com.quizarena.dto;

public class AnswerDTO {
    
    private int questionNo;
    private int choosenOption;
    private int timeTaken;
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
    public int getTimeTaken() {
        return timeTaken;
    }
    public void setTimeTaken(int timeTaken) {
        this.timeTaken = timeTaken;
    }

    
}
