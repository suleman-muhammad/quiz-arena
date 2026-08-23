package com.quizarena.game;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.quizarena.dto.CreateRoomRequest;
import com.quizarena.dto.JoinRequestAnswer;
import com.quizarena.dto.RoomInfo;

@Service
public class GameManager {
    
    private final Map<String,GameRoom> rooms = new ConcurrentHashMap<>();

    public GameRoom createRoom(CreateRoomRequest request){
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
        if(rooms.containsKey(code)){
            return rooms.get(code);
        }
        return null;
    }

    public JoinRequestAnswer addPlayerToRoom(String roomCode,String playernickName){

        System.out.println("Manager: Adding Player to Room with name" + playernickName);

        
        if(rooms.containsKey(roomCode)){
            GameRoom room = rooms.get(roomCode);
            if(room.getState() != RoomState.WAITING){
                System.out.println("Manager: Player with name" + playernickName + " already exists in the Room with code: " + roomCode);
                return new JoinRequestAnswer("Cannot Join ROOM mid Game.",null);
            }

            Player p = new Player();
            p.setNickName(playernickName);
            p.setCurrentPos(1);
            boolean result = room.addPlayer(p);

            if(result){
                RoomInfo info = new RoomInfo();
                info.setPlayers(room.getPlayers());
                info.setRoomCode(room.getRoomCode());
                info.setState(room.getState());
                System.out.println("Manager : Added Player to Room successfully.");
                return new JoinRequestAnswer("Ok",info);
            }else{
                System.out.println("Manager : Could not add Player to Room.");

                return new JoinRequestAnswer(
                    "Player with Given Name already exists.",null
                );
            }
        }
        System.out.println("Manager: NO ROOM available with given code.");

        return new JoinRequestAnswer("NO ROOM available with given code.",null);
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
