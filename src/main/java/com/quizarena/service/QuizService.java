package com.quizarena.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.quizarena.entity.Question;
import com.quizarena.entity.Quiz;
import com.quizarena.entity.QuizCategory;
import com.quizarena.entity.QuizConcept;
import com.quizarena.entity.TriviaFact;
import com.quizarena.repository.QuizCategoryRepository;
import com.quizarena.repository.QuizRepository;

@Service
public class QuizService {
    
    private final QuizRepository quizRepository;
    private final QuizCategoryRepository quizCategoryRepository;

    public QuizService(QuizRepository quizRepository, QuizCategoryRepository quizCategoryRepository) {
        this.quizRepository = quizRepository;
        this.quizCategoryRepository = quizCategoryRepository;
    }

    public Quiz createQuiz(Quiz quiz) {
        if (quiz == null) {
            return null;
        }

        if (quiz.getCategory() != null) {
            QuizCategory cat = quiz.getCategory();
            if (cat.getId() != null) {
                Optional<QuizCategory> existing = quizCategoryRepository.findById(cat.getId());
                if (existing.isPresent()) {
                    quiz.setCategory(existing.get());
                } else {
                    quiz.setCategory(quizCategoryRepository.save(cat));
                }
            }
        }

        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                q.setQuiz(quiz);
            }
        }
        if (quiz.getTriviaFacts() != null) {
            for (TriviaFact fact : quiz.getTriviaFacts()) {
                fact.setQuiz(quiz);
            }
        }
        if (quiz.getConcepts() != null) {
            for (QuizConcept concept : quiz.getConcepts()) {
                concept.setQuiz(quiz);
            }
        }

        quiz = quizRepository.saveAndFlush(quiz);
        return quiz;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public ResponseEntity<Quiz> findQuizWithId(Long id) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        if (quiz.isPresent()) {
            return ResponseEntity.ok(quiz.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<Quiz> deleteQuizById(Long id) {
        if (quizRepository.existsById(id)) {
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}