package com.quizarena.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.quizarena.entity.Question;
import com.quizarena.entity.Quiz;
import com.quizarena.entity.QuizConcept;
import com.quizarena.entity.TriviaFact;
import com.quizarena.repository.QuizCategoryRepository;
import com.quizarena.repository.QuizRepository;

@Service
public class QuizService {
    
    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository,QuizCategoryRepository quizCategoryRepository){
        this.quizRepository = quizRepository;
    }

    public Quiz creatQuiz(Quiz quiz){
        if(quiz == null){
            return null;
        }
        
        for (Question q: quiz.getQuestions()){
            q.setQuiz(quiz);
        }
        for (TriviaFact fact: quiz.getTriviaFacts()){
            fact.setQuiz(quiz);
        }

        for(QuizConcept concept: quiz.getConcepts()){
            concept.setQuiz(quiz);
        }

        quiz = quizRepository.saveAndFlush(quiz);
        return quiz;
    }

    public List<Quiz> getAllQuizzes(){
        return quizRepository.findAll();
    }

    public ResponseEntity<Quiz> findQuizWithId(Long id){

        Optional<Quiz> quiz = quizRepository.findById(id);
        
        if(quiz.isPresent()){
            return ResponseEntity.ok(quiz.get());
        }else{
            return ResponseEntity.notFound().build(); 
        }
    }

    public ResponseEntity<Quiz> deleteQuizById(Long id){
        if(quizRepository.existsById(id)){
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build(); 
        }
        return ResponseEntity.notFound().build(); 
    }

}
