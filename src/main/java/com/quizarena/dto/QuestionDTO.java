package com.quizarena.dto;

public class QuestionDTO {
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private int timeLimit;
    private int questionNo;

    public String getQuestionText() {
        return questionText;
    }
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    public String getOptionA() {
        return optionA;
    }
    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }
    public String getOptionB() {
        return optionB;
    }
    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }
    public String getOptionC() {
        return optionC;
    }
    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }
    public String getOptionD() {
        return optionD;
    }
    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }
    public int getTimeLimit() {
        return timeLimit;
    }
    public void setTimeLimit(int timeLimit) {
        this.timeLimit = timeLimit;
    }
    public int getQuestionNo() {
        return questionNo;
    }
    public void setQuestionNo(int questionNo) {
        this.questionNo = questionNo;
    }

    
    
}
