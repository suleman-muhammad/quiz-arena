package com.quizarena.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.quizarena.entity.Quiz;
import com.quizarena.service.QuizService;

import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;



@WebMvcTest(QuizController.class)
public class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean 
    private QuizService quizService;

    @Autowired 
    private ObjectMapper objectMapper;
    @Test
    void testReturnAllQuizzes() throws Exception{

        Quiz q1 = new Quiz();
        Quiz q2 = new Quiz();

        q1.setId(1L);
        q2.setId(2L);

        q1.setTitle("Mock Quiz 1");
        q2.setTitle("Mock Quiz 2");

        when(quizService.getAllQuizzes()).thenReturn(List.of(q1,q2));

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Mock Quiz 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].title").value("Mock Quiz 2"));
    }

    @Test
    public void testGetQuizByIdWhenExists() throws Exception{
        Quiz q1 = new Quiz();

        q1.setId(1L);
        q1.setTitle("Mock Quiz 1");

        when(quizService.findQuizWithId(1L)).thenReturn(ResponseEntity.ok(q1));

        mockMvc.perform(get("/api/quizzes/1"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.title").value("Mock Quiz 1")); 
    }

    @Test
    public void testGetQuizByIdWhenNotExists() throws Exception{
    
        when(quizService.findQuizWithId(2L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/api/quizzes/2"))
            .andExpect(status().isNotFound());
    }

    @Test 
    void testCreatQuiz() throws Exception{
        Quiz requestQuiz = new Quiz();
        Quiz responseQuiz = new Quiz();

        requestQuiz.setTitle("Mock Quiz");
        responseQuiz.setTitle("Mock Quiz");

        responseQuiz.setId(1L);

        when(quizService.createQuiz(any(Quiz.class))).thenReturn(responseQuiz);

        mockMvc.perform(post("/api/quizzes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestQuiz))
                            )
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.id").value(1))
                            .andExpect(jsonPath("$.title").value("Mock Quiz"));
    }
}
