package com.quizarena.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quizarena.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz,Long>{

}
