package com.quizarena.dto.request;

public record CreateRoomRequest(long quizId,String hostNickName,boolean hostIsPlaying) {
} 
