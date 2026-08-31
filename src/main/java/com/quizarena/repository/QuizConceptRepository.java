package com.quizarena.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quizarena.entity.QuizConcept;

public interface QuizConceptRepository extends JpaRepository<QuizConcept, Long>{
    
}
