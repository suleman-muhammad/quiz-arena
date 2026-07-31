package com.quizarena.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.entity.Question;
import com.quizarena.entity.Quiz;
import com.quizarena.repository.QuizRepository;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    
    private final QuizRepository quizRepository;

    public QuizController(QuizRepository quizRepository){
        this.quizRepository = quizRepository;
    }


    @PostMapping
    public Quiz creatQuiz(@RequestBody Quiz quiz){
        
        for (Question q: quiz.getQuestions()){
            q.setQuiz(quiz);
        }

        quiz = quizRepository.saveAndFlush(quiz);
        return quiz;
    }


    @GetMapping
    public List<Quiz> getAllQuizzes(){
        return quizRepository.findAll();
    }
}
