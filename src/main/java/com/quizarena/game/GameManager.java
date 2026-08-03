package com.quizarena.game;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class GameManager {
    
    private final Map<String,GameRoom> rooms = new ConcurrentHashMap<>();

    public GameRoom createRoom(Long quizId,String hostNickName){
        String code = generateCode();
        Player p = new Player();
        p.setNickName(hostNickName);
        GameRoom room = new GameRoom(code,quizId,hostNickName);
        room.addPlayer(p);
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

    public GameRoom addPlayerToRoom(String code,Player player){
        if(rooms.containsKey(code)){
            GameRoom room = rooms.get(code);
            boolean result = room.addPlayer(player);
            return result ? room : null;
        }
        return null;
    }

    public GameRoom removePlayerFromRoom(String code,String playernickName){
        if(rooms.containsKey(code)){
            GameRoom room = rooms.get(code);
            Player player = new Player();
            player.setNickName(playernickName);
            room.removePlayer(player);
            return room;
        }
        return null;
    }

    public void removeRoom(String code){
        if(rooms.containsKey(code)){
            rooms.remove(code);
        }
    }


}
