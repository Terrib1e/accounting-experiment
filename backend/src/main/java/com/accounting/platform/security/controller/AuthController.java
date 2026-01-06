package com.accounting.platform.security.controller;

import com.accounting.platform.common.dto.ApiResponse;
import com.accounting.platform.security.dto.AuthResponse;
import com.accounting.platform.security.dto.LoginRequest;
import com.accounting.platform.security.dto.RegisterRequest;
import com.accounting.platform.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        System.out.println("DEBUG: Register request received for: " + request.getEmail());
        try {
             return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
        } catch (Exception e) {
            System.out.println("DEBUG: Register error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }
}
