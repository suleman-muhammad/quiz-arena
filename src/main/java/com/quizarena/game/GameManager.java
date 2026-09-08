package com.quizarena.game;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.quizarena.dto.response.JoinRequestResponse;
import com.quizarena.dto.response.RoomInfoDTO;
import com.quizarena.dto.request.CreateRoomRequest;

@Service
public class GameManager {
    
    private final Map<String,GameRoom> rooms = new ConcurrentHashMap<>();

    public synchronized GameRoom createRoom(CreateRoomRequest request){
        Long quizId = request.quizId();
        String hostNickName = request.hostNickName();
        String code = generateCode();

        Player p = new Player();
        p.setNickName(hostNickName);
        p.setCurrentPos(1);

        GameRoom room = new GameRoom(code,quizId,hostNickName);
        if(request.hostIsPlaying()) room.addPlayer(p);

        rooms.put(code, room);
        return room;
    }

    private String generateCode(){
        Random rm = new Random();
        StringBuilder sb = new StringBuilder();

        for(int i = 0; i<6; i++){
            if (i % 2 == 0){
                sb.append(rm.nextInt(10));
            }else{
                sb.append((char) rm.nextInt(65,91));

            }
        }

        if(rooms.containsKey(sb.toString())){
            return generateCode();
        }else{
            return sb.toString();
        }
    }

    public GameRoom findRoomByCode(String code){
        return rooms.get(code);
    }

    public JoinRequestResponse addPlayerToRoom(String roomCode,String playernickName){

        if(rooms.containsKey(roomCode)){
            GameRoom room = rooms.get(roomCode);
            if(room.getState() != RoomState.WAITING){
                return new JoinRequestResponse("Cannot Join ROOM mid Game.",null);
            }

            Player p = new Player();
            p.setNickName(playernickName);
            p.setCurrentPos(1);
            boolean result = room.addPlayer(p);

            if(result){

                RoomInfoDTO info = new RoomInfoDTO();
                info.setPlayers(room.getPlayers());
                info.setRoomCode(room.getRoomCode());
                info.setState(room.getState());
                info.setQuizId(room.getQuizId());
                
                return new JoinRequestResponse("Ok",info);
            }else{
                return new JoinRequestResponse(
                    "Player with Given Name already exists.",null
                );
            }
        }

        return new JoinRequestResponse("NO ROOM available with given code.",null);
    }

    public GameRoom removePlayerFromRoom(String code,String playernickName){
        if(rooms.containsKey(code)){
            GameRoom room = rooms.get(code);
            Player player = new Player();
            player.setNickName(playernickName);
            boolean result = room.removePlayer(player);
            return result ? room : null;
        }
        return null;
    }

    public void removeRoom(String code){
        if(rooms.containsKey(code)){
            rooms.remove(code);
        }
    }

    public boolean roomExists(String roomCode){
        return this.rooms.containsKey(roomCode);
    }
}
