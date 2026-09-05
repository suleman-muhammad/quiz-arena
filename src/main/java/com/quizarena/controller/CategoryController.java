package com.quizarena.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.entity.QuizCategory;
import com.quizarena.service.CategoryService;

@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryService categoryService;

    CategoryController(CategoryService service){
        this.categoryService = service;
    }

    @GetMapping("/quiz-categories")
    public List<QuizCategory> getAllCategories(){
        return categoryService.getAllQuizCategories();
    }
}
