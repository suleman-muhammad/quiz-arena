package com.quizarena.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;
import com.quizarena.entity.Quiz;
import com.quizarena.service.QuizService;

import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import javax.print.attribute.standard.Media;


@WebMvcTest(QuizController.class)
public class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean 
    private QuizService quizService;

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
}
