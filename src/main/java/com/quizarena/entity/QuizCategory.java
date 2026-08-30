package com.quizarena.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class QuizCategory {
    
    @Id
    private String id;
    private String label;
    private String icon;


    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getLabel() {
        return label;
    }
    public void setLabel(String label) {
        this.label = label;
    }
    public String getIcon() {
        return icon;
    }
    public void setIcon(String icon) {
        this.icon = icon;
    }
}
