package com.quizarena.game;

import java.util.Comparator;

public class ComparePlayersForPosition implements Comparator<Player>{
    
    @Override
    public int compare(Player p1,Player p2){
        return (int) (p1.getScore() - p2.getScore());
    }
}
