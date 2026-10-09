package com.quizarena.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.quizarena.game.GameManager;
import com.quizarena.game.GameRoom;
import com.quizarena.game.Player;
import com.quizarena.game.RoomState;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;


@WebMvcTest(RoomController.class)
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean 
    private GameManager gameManager;

    @Test 
    void testGetRoomInfo() throws Exception{

        GameRoom responseRoom = new GameRoom("1L2F3T",1L,"Host 1");

        responseRoom.setPlayers(new ArrayList<>());
        
        when(gameManager.findRoomByCode(any(String.class))).thenReturn(responseRoom);

        mockMvc.perform(get("/api/rooms/1L2F3T").accept(MediaType.APPLICATION_JSON))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomCode").value("1L2F3T"))
                .andExpect(jsonPath("$.players.size()").value(0))
                .andExpect(jsonPath("$.quizId").value(1))
                .andExpect(jsonPath("$.state").value(RoomState.WAITING.toString()));
    }

    @Test 
    void testgetRoomQuiz() throws Exception{

        GameRoom responseRoom = new GameRoom("1L2F3T",1L,"Host 1");

        responseRoom.setPlayers(new ArrayList<>());
        
        when(gameManager.findRoomByCode(any(String.class))).thenReturn(responseRoom);

        mockMvc.perform(get("/api/rooms/1L2T3F/quiz")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").value(1L));
    }

    @Test
    void testGetLeaderBoard() throws Exception{
        GameRoom responseRoom = new GameRoom("1L2F3T",1L,"Host 1");
        Player p1 = new Player();

        p1.setCurrentPosition(1);
        p1.setId("234");
        p1.setCombo(3);
        p1.setNickName("Mock Player 1");

        responseRoom.setPlayers(List.of(p1));
        
        when(gameManager.findRoomByCode(any(String.class))).thenReturn(responseRoom);

        mockMvc.perform(get("/api/rooms/1L2T3F/leaderboard")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value("234"))                   
                .andExpect(jsonPath("$[0].currentPosition").value(1))            
                .andExpect(jsonPath("$[0].nickName").value("Mock Player 1"))                   
                .andExpect(jsonPath("$[0].combo").value(3));                   

    }
    
}
