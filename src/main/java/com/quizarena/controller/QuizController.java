package com.quizarena.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizarena.entity.Quiz;
import com.quizarena.service.QuizService;

@RestController
@RequestMapping("/api/quizzes") // this class handles this end point and sub end points of it -if any
public class QuizController {
    
    private final QuizService quizService;
    

    public QuizController(QuizService quizService){
        this.quizService = quizService;
    }


    


    // this method handles the Post mapping on the class' original url
    @PostMapping
    public Quiz creatQuiz(@RequestBody Quiz quiz){ // request body handles the conversion of json to Quiz and quiz to Json while returning
        
        return quizService.creatQuiz(quiz);
    }

    // get mapping on main url
    // returns all quizzes
    @GetMapping
    public List<Quiz> getAllQuizzes(){
        return quizService.getAllQuizzes();
    }

    //get mapping with main + sub url
    // @PathVariable takes the id from the url and assigns it to id
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> quizWithId(@PathVariable Long id){
        return quizService.findQuizWithId(id);
    }


    // delete mapping with main + sub url
    @DeleteMapping("/{id}")
    public ResponseEntity<Quiz> delteQuiz(@PathVariable Long id){
        return quizService.deleteQuizById(id);
    }

}
