package com.quizarena.dto.event;

public record ChatMessage(String roomCode, String sender, String msg) {
}
