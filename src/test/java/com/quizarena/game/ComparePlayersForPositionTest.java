package com.quizarena.game;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ComparePlayersForPositionTest {
    
    private ComparePlayersForPosition cp;


    @BeforeEach 
    void startUP(){
        cp = new ComparePlayersForPosition();
    }

    @Test
    void compare_firstPlayerhasMoreScores_returnsNegativeNumber() throws Exception{
        Player p1 = new Player();
        Player p2 = new Player();

        p1.setScore(10);
        p2.setScore(5);
        assertTrue(cp.compare(p1,p2) < 0);;
    }

    @Test
    void compare_secondPlayerhasMoreScores_returnsPositiveNumber() throws Exception{
        Player p1 = new Player();
        Player p2 = new Player();

        p1.setScore(10);
        p2.setScore(15);
        assertTrue(cp.compare(p1,p2) > 0);;
    }
    
    @Test
    void compare_bothPlayerEqualsScores_returnsZero() throws Exception{
        Player p1 = new Player();
        Player p2 = new Player();

        p1.setScore(10);
        p2.setScore(10);
        assertTrue(cp.compare(p1,p2) == 0);;
    }

}
