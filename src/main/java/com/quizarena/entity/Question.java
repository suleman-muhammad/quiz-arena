package com.quizarena.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "questions")
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;


    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private int correctOption;
    private int timeLimitSeconds = 15;


    // dont serialize this side.
    // for stop refrencing back to back between quiz and questions.
    @JsonBackReference
    // relationship to quiz table. 
    @ManyToOne(fetch = FetchType.LAZY)
    // which column to join on.
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;


    public Question() {
    }


    public int getId() {
        return id;
    }


    public void setId(int id) {
        this.id = id;
    }


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


    public int getCorrectOption() {
        return correctOption;
    }


    public void setCorrectOption(int correctOption) {
        this.correctOption = correctOption;
    }


    public int getTimeLimitSeconds() {
        return timeLimitSeconds;
    }


    public void setTimeLimitSeconds(int timeLimitSeconds) {
        this.timeLimitSeconds = timeLimitSeconds;
    }


    public Quiz getQuiz() {
        return quiz;
    }


    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    
}
