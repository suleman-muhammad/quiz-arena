package com.quizarena.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;


@Entity
@Table(name = "quizzes")
public class Quiz {


    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private long id;

    private String title;
    private String description;
    private LocalDateTime createdAt;

    @ManyToOne
    private QuizCategory category;

    @JsonManagedReference 
    @OneToMany(mappedBy = "quiz",cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER) 
    private List<Question> questions = new ArrayList<>();

    @JsonManagedReference 
    @OneToMany(mappedBy = "quiz",cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER) 
    private List<TriviaFact> triviaFacts = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval= true, fetch = FetchType.EAGER)
    private List<QuizConcept> concepts = new ArrayList<>();
    
    public Quiz() {
    }

    @PrePersist
    protected void onCreate(){
        this.createdAt = LocalDateTime.now();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
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

    public QuizCategory getCategory() {
        return category;
    }

    public void setCategory(QuizCategory category) {
        this.category = category;
    }

    public List<TriviaFact> getTriviaFacts() {
        return triviaFacts;
    }

    public void setTriviaFacts(List<TriviaFact> triviaFacts) {
        this.triviaFacts = triviaFacts;
    }

    public List<QuizConcept> getConcepts() {
        return concepts;
    }

    public void setConcepts(List<QuizConcept> concepts) {
        this.concepts = concepts;
    }
}
