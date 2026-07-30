package com.quizarena.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

// represent a table in database.
@Entity
// table name in database
@Table(name = "quizzes")
public class Quiz {


    @Id  // primary id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto generated identity
    private int id;


    private String title;
    private String description;
    private LocalDateTime createdAt;

    // Serialize this side.
    // to stop refrencing back to back between quiz and questions.
    @JsonManagedReference 
    //for relation ship with questions, and remove quistons if parent quiz is deleted.  
    @OneToMany(mappedBy = "quiz",cascade = CascadeType.ALL, orphanRemoval = true) 
    private List<Question> questions = new ArrayList<>();

    public Quiz() {
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
    

}
