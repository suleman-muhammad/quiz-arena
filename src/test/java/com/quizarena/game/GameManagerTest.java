package com.quizarena.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.quizarena.dto.request.CreateRoomRequest;
import com.quizarena.dto.response.JoinRoomResponse;;
public class GameManagerTest {
    

    private GameManager manager;


    @BeforeEach 
    void setup(){
        manager = new GameManager();
    }

    @Test 
    void createRoom_normalConditions_returnsNotNull() throws Exception{
        CreateRoomRequest request = new CreateRoomRequest(1, "Mock host", true);
        GameRoom testRoom = manager.createRoom(request);
        assertNotNull(testRoom);

        assertEquals(request.quizId(), testRoom.getQuizId());
        assertEquals(request.hostNickName(), testRoom.getHost());
        assertTrue(testRoom.getPlayers().size() > 0);
    }

    @Test 
    void findRoomByCode_existingRoom_returnsNotNull() throws Exception{
        CreateRoomRequest request = new CreateRoomRequest(1, "Mock host", true);
        GameRoom room  = manager.createRoom(request);

        GameRoom testRoom = manager.findRoomByCode(room.getRoomCode());
        assertNotNull(testRoom);

        assertEquals(room.getRoomCode(), testRoom.getRoomCode());
        assertEquals(room.getQuizId(), testRoom.getQuizId());
        assertEquals(room.getHost(), testRoom.getHost());
        assertEquals(room.getState().name(), testRoom.getState().name());
    }

    @Test
    void findRoomCode_nonExistingRoom_returnsNull() throws Exception{
        GameRoom testRoom = manager.findRoomByCode("1L2P3R");
        assertNull(testRoom);
    }
 
}