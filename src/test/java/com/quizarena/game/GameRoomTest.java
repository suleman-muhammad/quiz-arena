package com.quizarena.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.quizarena.entity.Question;

public class GameRoomTest {
    
    private GameRoom testRoom;

    @BeforeEach 
    void setup(){
        testRoom = new GameRoom("1L2T3F", 1L, "Test Host");
    }

    @Test 
    void testAddPlayer() throws Exception{
        Player p1 = new Player();
        Player p2 = new Player();

        p1.setNickName("Test Player");
        p1.setCurrentPosition(1);
        p1.setId("123");

        p2.setNickName("Test Player");
        p2.setCurrentPosition(2);
        p2.setId("534");

        assertEquals(testRoom.getPlayers().size(), 0);

        assertTrue(testRoom.addPlayer(p1));
        assertEquals(testRoom.getPlayers().size(), 1);

        assertFalse(testRoom.addPlayer(p2));
        assertEquals(testRoom.getPlayers().size(), 1);

        p2.setNickName("Test Player 2");

        assertTrue(testRoom.addPlayer(p2));
        assertEquals(testRoom.getPlayers().size(), 2);
    }
}
