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


    private String description;
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

    
}
