package com.quizarena.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @RequestMapping(
        value = {"/ping", "/health", "/api/health", "/"},
        method = {RequestMethod.GET, RequestMethod.HEAD},
        produces = MediaType.TEXT_PLAIN_VALUE
    )
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("OK");
    }
}
