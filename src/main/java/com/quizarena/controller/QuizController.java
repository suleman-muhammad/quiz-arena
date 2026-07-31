package com.quizarena.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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


    @GetMapping("/{id}")
    public ResponseEntity<Quiz> quizWithId(@PathVariable Long id){
        Optional<Quiz> quiz = quizRepository.findById(id);
        
        if(quiz.isPresent()){
            return ResponseEntity.ok(quiz.get());
        }else{
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Quiz> delteQuiz(@PathVariable Long id){
        if(quizRepository.existsById(id)){
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
