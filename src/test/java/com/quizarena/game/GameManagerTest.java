package com.quizarena.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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

    @Test  
    void addPlayerToRoom_existingRoom_returnsResponseWithRoomInfo() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom testRoom = manager.createRoom(roomRequest);

        JoinRoomResponse response = manager.addPlayerToRoom(testRoom.getRoomCode(), "Mock Player");
        
        assertNotNull(response.roomInfo());
        assertEquals(response.message(), "Ok");

        assertEquals(response.roomInfo().getRoomCode(), testRoom.getRoomCode());
        assertEquals(response.roomInfo().getState(), testRoom.getState());
    }

    @Test  
    void addPlayerToRoom_nonExistingRoom_returnsResponseWithNullRoomInfo() throws Exception{

        JoinRoomResponse response = manager.addPlayerToRoom("1L2F3T", "Mock Player");
        
        assertNull(response.roomInfo());
        assertEquals(response.message(), "No ROOM found.");

    }
    
    @Test  
    void addPlayerToRoom_roomStateIsNotWaiting_returnsResponseWithNullRoomInfo() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom testRoom = manager.createRoom(roomRequest);

        testRoom.setState(RoomState.BETWEEN_QUESTIONS);
        JoinRoomResponse response = manager.addPlayerToRoom(testRoom.getRoomCode(), "Mock Player");
        
        assertNull(response.roomInfo());
        assertEquals(response.message(), "Cannot Join ROOM mid Game.");

    }

    @Test  
    void addPlayerToRoom_playerWithNameAlreadyExists_returnsResponseWithNullRoomInfo() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom testRoom = manager.createRoom(roomRequest);

        manager.addPlayerToRoom(testRoom.getRoomCode(), "Mock Player");
        JoinRoomResponse response = manager.addPlayerToRoom(testRoom.getRoomCode(), "Mock Player");
        
        assertNull(response.roomInfo());
        assertEquals(response.message(), "Player with Given Name already exists.");

    }

    @Test 
    void removePlayerFromRoom_existingRoomAndPlayer_returnsUpdatedGameRoom() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom room = manager.createRoom(roomRequest);

        GameRoom testRoom = manager.removePlayerFromRoom(room.getRoomCode(), "Mock host");

        assertNotNull(testRoom);
        assertEquals(testRoom.getPlayers().size(), 0);
    }

    @Test 
    void removePlayerFromRoom_existingRoomAndNonExistingPlayer_returnsNull() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom room = manager.createRoom(roomRequest);
        
        GameRoom testRoom = manager.removePlayerFromRoom(room.getRoomCode(), "Mock player 1");
        assertNull(testRoom);
    }

    @Test 
    void removePlayerFromRoom_nonExistingRoom_returnsNull() throws Exception{
            
        GameRoom testRoom = manager.removePlayerFromRoom("1L2T3F", "Mock host");
        assertNull(testRoom);
    }


    @Test 
    void roomExists_existingRoom_returnsTrue() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom room = manager.createRoom(roomRequest);

        assertTrue(manager.roomExists(room.getRoomCode()));
    }

    @Test 
    void roomExists_nonExistingRoom_returnsFalse() throws Exception{
        assertFalse(manager.roomExists("1L2T3F"));
    }

    @Test 
    void removeRoom_existingRoom_removesRoomFromMap() throws Exception{
        CreateRoomRequest roomRequest = new CreateRoomRequest(1, "Mock host", true);
        GameRoom room = manager.createRoom(roomRequest);
        manager.removeRoom(room.getRoomCode());
        assertFalse(manager.roomExists(room.getRoomCode()));
    }
    @Test 
    void removeRoom_nonExistingRoom_returnsFalse() throws Exception{
        manager.removeRoom("1L2T3F");
        assertFalse(manager.roomExists("1L2T3F"));
    }
}