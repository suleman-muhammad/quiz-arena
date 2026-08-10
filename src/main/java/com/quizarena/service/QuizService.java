package com.quizarena.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.quizarena.entity.Question;
import com.quizarena.entity.Quiz;
import com.quizarena.repository.QuizRepository;

@Service
public class QuizService {
    
    // this is a bean
    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository){
        this.quizRepository = quizRepository;
    }



    public Quiz creatQuiz(Quiz quiz){
        if(quiz == null){
            return null;
        }
        // foreign key does not gets attached 
        // cause only quiz gets serialized 
        // so we have to set the quiz_id field in Questions manually
        for (Question q: quiz.getQuestions()){
            q.setQuiz(quiz);
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
            return ResponseEntity.notFound().build(); // 404 error code
        }
    }

    public ResponseEntity<Quiz> deleteQuizById(Long id){
        if(quizRepository.existsById(id)){
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // returns 204 cause nothing to show.
        }
        return ResponseEntity.notFound().build(); // returns 404 
    }

}
