package com.quizarena.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.quizarena.entity.QuizCategory;
import com.quizarena.repository.QuizCategoryRepository;

@Service
public class CategoryService {
    
    private final QuizCategoryRepository quizCategoryRepository;

    CategoryService(QuizCategoryRepository repo){
        this.quizCategoryRepository = repo;
    }

    public List<QuizCategory> getAllQuizCategories(){
        return quizCategoryRepository.findAll();
    }
}
