package com.quizarena.game;

import java.util.Comparator;

public class ComparePlayersForPosition implements Comparator<Player>{
    
    @Override
    public int compare(Player p1,Player p2){
        return Long.compare(p2.getScore(),p1.getScore());
    }
}
