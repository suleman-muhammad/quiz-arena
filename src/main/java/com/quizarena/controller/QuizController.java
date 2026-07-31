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
@RequestMapping("/api/quizzes") // this class handles this end point and sub end points of it -if any
public class QuizController {
    
    // this is a bean
    private final QuizRepository quizRepository;


    public QuizController(QuizRepository quizRepository){
        this.quizRepository = quizRepository;
    }


    // this method handles the Post mapping on the class' original url
    @PostMapping
    public Quiz creatQuiz(@RequestBody Quiz quiz){ // request body handles the conversion of json to Quiz and quiz to Json while returning
        
        // foreign key does not gets attached 
        // cause only quiz gets serialized 
        // so we have to set the quiz_id field in Questions manually
        for (Question q: quiz.getQuestions()){
            q.setQuiz(quiz);
        }

        quiz = quizRepository.saveAndFlush(quiz);
        return quiz;
    }

    // get mapping on main url
    // returns all quizzes
    @GetMapping
    public List<Quiz> getAllQuizzes(){
        return quizRepository.findAll();
    }

    //get mapping with main + sub url
    // @PathVariable takes the id from the url and assigns it to id
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> quizWithId(@PathVariable Long id){
        Optional<Quiz> quiz = quizRepository.findById(id);
        
        if(quiz.isPresent()){
            return ResponseEntity.ok(quiz.get());
        }else{
            return ResponseEntity.notFound().build(); // 404 error code
        }
    }


    // delete mapping with main + sub url
    @DeleteMapping("/{id}")
    public ResponseEntity<Quiz> delteQuiz(@PathVariable Long id){
        if(quizRepository.existsById(id)){
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // returns 204 cause nothing to show.
        }
        return ResponseEntity.notFound().build(); // returns 404 
    }

}
