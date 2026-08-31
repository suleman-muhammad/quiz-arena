package com.quizarena.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quizarena.entity.QuizCategory;

public interface QuizCategoryRepository extends JpaRepository<QuizCategory, String>{
   
}
