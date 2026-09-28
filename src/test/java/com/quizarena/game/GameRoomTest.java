package com.quizarena.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.quizarena.dto.event.QuestionOptionsDTO;
import com.quizarena.dto.request.SubmitAnswerRequest;
import com.quizarena.entity.Question;


public class GameRoomTest {
    
    private GameRoom testRoom;

    @BeforeEach 
    void setup(){
        testRoom = new GameRoom("1L2T3F", 1L, "Test Host");
    }

    private Question createTestQuestion(int timeLimitSeconds) {
        List<Question> pool = new ArrayList<>();

        Question q1 = new Question();
        q1.setQuestionText("What is the capital of France?");
        q1.setOptionA("London");
        q1.setOptionB("Paris");
        q1.setOptionC("Berlin");
        q1.setOptionD("Madrid");
        q1.setCorrectOption(1); // Paris
        q1.setTimeLimitSeconds(timeLimitSeconds);
        pool.add(q1);

        Question q2 = new Question();
        q2.setQuestionText("Which planet is known as the Red Planet?");
        q2.setOptionA("Venus");
        q2.setOptionB("Mars");
        q2.setOptionC("Jupiter");
        q2.setOptionD("Saturn");
        q2.setCorrectOption(1); // Mars
        q2.setTimeLimitSeconds(timeLimitSeconds);
        pool.add(q2);

        Question q3 = new Question();
        q3.setQuestionText("What is the chemical symbol for Gold?");
        q3.setOptionA("Au");
        q3.setOptionB("Ag");
        q3.setOptionC("Fe");
        q3.setOptionD("Pb");
        q3.setCorrectOption(0); // Au
        q3.setTimeLimitSeconds(timeLimitSeconds);
        pool.add(q3);

        Question q4 = new Question();
        q4.setQuestionText("How many continents are on Earth?");
        q4.setOptionA("5");
        q4.setOptionB("6");
        q4.setOptionC("7");
        q4.setOptionD("8");
        q4.setCorrectOption(2); // 7
        q4.setTimeLimitSeconds(timeLimitSeconds);
        pool.add(q4);

        int randomIndex = new java.util.Random().nextInt(pool.size());
        return pool.get(randomIndex);
    }

    private List<Player> createSamplePlayers(){
        Player p1 = new Player();
        Player p2 = new Player();

        p1.setNickName("Test Player 1");
        p1.setCurrentPosition(1);
        p1.setId("123");

        p2.setNickName("Test Player 2");
        p2.setCurrentPosition(1);
        p2.setId("534");

        return new ArrayList<>(List.of(p1,p2));
    }

    @Test 
    void addPlayer_waitingState_returnsTrue() throws Exception{
        
        List<Player> players = createSamplePlayers();

        assertTrue(testRoom.addPlayer(players.get(0)));
    }

    @Test 
    void addPlayer_waitingstateDuplicationAddition_returnsFalse() throws Exception{
        
        List<Player> players = createSamplePlayers();
        testRoom.addPlayer(players.get(0));

        assertFalse(testRoom.addPlayer(players.get(0)));
    }

    @Test 
    void addPlayer_otherstate_returnsFalse() throws Exception{

        List<Player> players = createSamplePlayers();

        testRoom.startRoom(new ArrayList<Question>());
        assertFalse(testRoom.addPlayer(players.get(0)));
    }

    @Test 
    void startRoom_waitingState_returnsTrue() throws Exception{
        assertTrue(testRoom.startRoom(new ArrayList<Question>()));
    }

    @Test 
    void startRoom_duplicateStart_returnsFalse() throws Exception{
        testRoom.startRoom(new ArrayList<Question>());
        assertFalse(testRoom.startRoom(new ArrayList<Question>()));
    }

    @Test  
    void getNextQuestion_roomInWaitingState_returnsNull() throws Exception{
        assertNull(testRoom.getNextQuestion());    
    }
    @Test  
    void getNextQuestion_roomInProgress_returnsQuestionDTO() throws Exception{
        QuestionOptionsDTO qOptions;
        Question q = createTestQuestion(15); 

        testRoom.startRoom(List.of(q));

        assertNotNull((qOptions = testRoom.getNextQuestion()));
        assertEquals(qOptions.getQuestionText(), q.getQuestionText());
        assertEquals(testRoom.getCurrQuestionNo(), 1);

    }

    @Test 
    void getNextQuestion_noMoreQuestions_returnsNullAndRoomFinished() throws Exception{
        Question q = createTestQuestion(15); 

        testRoom.startRoom(List.of(q));
        testRoom.getNextQuestion();

        assertNull(testRoom.getNextQuestion());
        assertTrue(testRoom.hasFinished());
    }

    private SubmitAnswerRequest setUpRoomAndCreateAnswerRequest(boolean wrongAnswerChoice){

        QuestionOptionsDTO qOptions;

        Question q = createTestQuestion(15);
        SubmitAnswerRequest submitAnswerRequest = new SubmitAnswerRequest();
        Player p = new Player();
        

        p.setCurrentPosition(1);
        p.setNickName("Mock Player 1");
        p.setId("234");
        p.setScore(0);

        submitAnswerRequest.setRoomCode(testRoom.getRoomCode());
        submitAnswerRequest.setChosenOption(!wrongAnswerChoice ?  q.getCorrectOption(): 3 - q.getCorrectOption());
        submitAnswerRequest.setPlayerNickName("Mock Player 1");

        testRoom.addPlayer(p);
        testRoom.startRoom(List.of(q,q));

        qOptions = testRoom.getNextQuestion();
        submitAnswerRequest.setQuestionNo(qOptions.getQuestionNo());
        testRoom.setPreviousQuestionSentTimeMillis(System.currentTimeMillis());

        return submitAnswerRequest;
    }

    @Test 
    void submitAnswer_validAnswer_awardsScore() throws Exception{

        int score;
        SubmitAnswerRequest submitAnswerRequest = setUpRoomAndCreateAnswerRequest(false);

        submitAnswerRequest.setAnsweredAtMillis(System.currentTimeMillis() + 5000);
        score = testRoom.submitAnswer(submitAnswerRequest);

        assertTrue(score > 0);

    }

    @Test void submitAnswer_duplicateSubmission_awardsMinusOne() throws Exception {
        int score;
        SubmitAnswerRequest submitAnswerRequest = setUpRoomAndCreateAnswerRequest(false);

        submitAnswerRequest.setAnsweredAtMillis(System.currentTimeMillis() + 5000);
        testRoom.submitAnswer(submitAnswerRequest);
        score = testRoom.submitAnswer(submitAnswerRequest);

        assertEquals(score, -1);

    }

    @Test 
    void submitAnswer_lateSubmission_awardsZero() throws Exception{

        int score;
        SubmitAnswerRequest submitAnswerRequest = setUpRoomAndCreateAnswerRequest(false);

        submitAnswerRequest.setAnsweredAtMillis(System.currentTimeMillis() + 16000);
        score = testRoom.submitAnswer(submitAnswerRequest);

        assertTrue(score == 0);

    }

    @Test 
    void submitAnswer_wrongOptionChosen_awardsZero() throws Exception{

        int score;
        SubmitAnswerRequest submitAnswerRequest = setUpRoomAndCreateAnswerRequest(true);

        submitAnswerRequest.setAnsweredAtMillis(System.currentTimeMillis() + 1000);
        score = testRoom.submitAnswer(submitAnswerRequest);

        assertTrue(score == 0);

    }


    private void setupRoomSingleQuestionWithSubmission(boolean wrongAnswerChoice, boolean doubleQuestion){
        QuestionOptionsDTO qOptions;
        List<Player> players = createSamplePlayers();
        Question q = createTestQuestion(15);
        SubmitAnswerRequest submitAnswerRequestPlayer1 = new SubmitAnswerRequest();
        
        submitAnswerRequestPlayer1.setRoomCode(testRoom.getRoomCode());
        submitAnswerRequestPlayer1.setChosenOption(!wrongAnswerChoice ?  q.getCorrectOption(): 3 - q.getCorrectOption());
        submitAnswerRequestPlayer1.setPlayerNickName(players.get(0).getNickName());

        testRoom.addPlayer(players.get(0));
        testRoom.startRoom(doubleQuestion ? List.of(q,q) : List.of(q));

        qOptions = testRoom.getNextQuestion();
        submitAnswerRequestPlayer1.setQuestionNo(qOptions.getQuestionNo());
        testRoom.setPreviousQuestionSentTimeMillis(System.currentTimeMillis());

        submitAnswerRequestPlayer1.setAnsweredAtMillis(System.currentTimeMillis() + 5000);
        testRoom.submitAnswer(submitAnswerRequestPlayer1);

    }

    private void setupRoomAndDoubleQuestionWithSubmission(boolean breakCombo){
        QuestionOptionsDTO qOptions;
        List<Player> players = createSamplePlayers();
        Question q = createTestQuestion(15);
        SubmitAnswerRequest submitAnswerRequestPlayer1 = new SubmitAnswerRequest();
        
        submitAnswerRequestPlayer1.setRoomCode(testRoom.getRoomCode());
        submitAnswerRequestPlayer1.setPlayerNickName(players.get(0).getNickName());
        submitAnswerRequestPlayer1.setChosenOption(q.getCorrectOption());

        testRoom.addPlayer(players.get(0));
        testRoom.startRoom(List.of(q,q));

        for(int i = 0; i<2; i++){
            qOptions = testRoom.getNextQuestion();
            submitAnswerRequestPlayer1.setQuestionNo(qOptions.getQuestionNo());
            testRoom.setPreviousQuestionSentTimeMillis(System.currentTimeMillis());
            submitAnswerRequestPlayer1.setAnsweredAtMillis(System.currentTimeMillis() + 5000);
            testRoom.submitAnswer(submitAnswerRequestPlayer1);
            testRoom.finishRound();
            submitAnswerRequestPlayer1.setChosenOption(breakCombo ? 3 - q.getCorrectOption() : q.getCorrectOption());
        }

    }

    @Test 
    void finishRound_playerAnsweredCorrect_awardsScoreAndIncreaseCombo() throws Exception{
        setupRoomSingleQuestionWithSubmission(false,false);

        List<Player> players =  testRoom.finishRound();

        assertEquals(players.size(), 1);
        assertTrue(players.getFirst().getScore() > 0);
        assertEquals(players.getFirst().getCombo(), 1);
    }

    @Test 
    void finishRound_playerAnsweredWrong_awardsScoreZero() throws Exception{
        setupRoomSingleQuestionWithSubmission(true,false);

        List<Player> players =  testRoom.finishRound();

        assertEquals(players.size(), 1);
        assertEquals(players.getFirst().getScore(), 0);
        assertEquals(players.getFirst().getCombo(), 0);
    }

    @Test 
    void finishRound_singleQuestion_stateTransitsToFinished() throws Exception{
        setupRoomSingleQuestionWithSubmission(false,false);
        testRoom.finishRound();
        assertEquals(testRoom.getState(), RoomState.FINISHED);
    }

    @Test 
    void finishRound_doubleQuestion_stateTransitsToBetweenQuestions() throws Exception{
        setupRoomSingleQuestionWithSubmission(false,true);
        testRoom.finishRound();
        assertEquals(testRoom.getState().name(), RoomState.BETWEEN_QUESTIONS.name());
    }

    @Test 
    void finishRound_twoQuestionsplayerAnsweredSecondWrong_awardsScoreZeroAndBreaksCombo() throws Exception{
        setupRoomAndDoubleQuestionWithSubmission(true);

        List<Player> players =  testRoom.getPlayers();

        assertEquals(players.size(), 1);
        assertTrue(players.getFirst().getScore() > 0);
        assertEquals(players.getFirst().getCombo(), 0);
    }

}
