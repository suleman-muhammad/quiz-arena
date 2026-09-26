package com.quizarena.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.quizarena.entity.QuizCategory;
import com.quizarena.service.CategoryService;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

@WebMvcTest(CategoryController.class)
public class CategoryControllerTest {
    @Autowired 
    private MockMvc mockMvc;

    @MockitoBean 
    private CategoryService categoryService;

    @Test 
    void testGetAllCategories() throws Exception{

        QuizCategory c1 = new QuizCategory();
        c1.setId("10X");
        c1.setLabel("Mock Quiz Category");

        when(categoryService.getAllQuizCategories()).thenReturn(List.of(c1));

        mockMvc.perform(get("/api/quiz-categories")
                            .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value("10X"))
            .andExpect(jsonPath("$[0].label").value("Mock Quiz Category"));                       

    }
}
