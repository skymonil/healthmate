package com.healthmate.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public ResponseEntity<Map<String, String>> testProtectedRoute(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return ResponseEntity.ok(Map.of(
            "message", "You are authenticated!",
            "email", email
        ));
    }
}
