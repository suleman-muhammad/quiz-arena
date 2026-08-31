package com.quizarena.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quizarena.entity.TriviaFact;

public interface TriviaFactRepository extends JpaRepository<TriviaFact, Long>{
    
}
