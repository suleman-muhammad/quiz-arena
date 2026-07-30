package com.quizarena.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quizarena.entity.Question;

public interface QuestionRepository extends JpaRepository<Question,Long>{
    
}
