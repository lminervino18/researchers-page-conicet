package com.researchers_conicet.controller;

import com.researchers_conicet.dto.auth.AuthResponse;
import com.researchers_conicet.dto.auth.PasswordRequest;
import com.researchers_conicet.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private static final String MASTER_PASSWORD = "ricardopeladoputo";

    @PostMapping("/validate")
    public ResponseEntity<?> validatePassword(@RequestBody PasswordRequest request) {
        if (MASTER_PASSWORD.equals(request.getPassword())) {
            String token = jwtService.generateToken();
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.badRequest().body("Contraseña incorrecta");
    }
}