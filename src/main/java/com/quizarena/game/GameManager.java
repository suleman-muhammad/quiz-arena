package com.quizarena.game;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class GameManager {
    
    private final Map<String,GameRoom> rooms = new ConcurrentHashMap<>();

    public GameRoom createRoom(Long quizId,String hostId){
        String code = generateCode();
        return new GameRoom(code,quizId,hostId);
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
        }else{
            return null;
        }
    }
}
