package com.quizarena.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class TriviaFact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String icon;
    private String title;
    private String text;

    // dont serialize this side.
    // for stop refrencing back to back between quiz and questions.
    @JsonBackReference
    // relationship to quiz table. 
    @ManyToOne(fetch = FetchType.LAZY)
    // which column to join on.
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;


    
    public String getIcon() {
        return icon;
    }
    public void setIcon(String icon) {
        this.icon = icon;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public long getId() {
        return id;
    }
    public void setId(long id){
        this.id = id;
    }
    public Quiz getQuiz() {
        return quiz;
    }
    public void setQuiz(Quiz quiz){
        this.quiz = quiz;
    }
}