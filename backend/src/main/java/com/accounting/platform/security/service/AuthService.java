package com.accounting.platform.security.service;

import com.accounting.platform.security.dto.AuthResponse;
import com.accounting.platform.security.dto.LoginRequest;
import com.accounting.platform.security.dto.RegisterRequest;
import com.accounting.platform.security.entity.Role;
import com.accounting.platform.security.entity.User;
import com.accounting.platform.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse register(RegisterRequest request) {
        System.out.println("DEBUG: Register service called for " + request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setEnabled(true); // Explicitly set enabled
        user.setAccountNonLocked(true);

        User savedUser = userRepository.saveAndFlush(user);
        System.out.println("DEBUG: User saved with ID: " + savedUser.getId());

        System.out.println("DEBUG: Attempting auto-login for " + request.getEmail());
        try {
            return login(LoginRequest.builder()
                    .email(request.getEmail())
                    .password(request.getPassword())
                    .build());
        } catch (Exception e) {
            System.out.println("DEBUG: Auto-login failed: " + e.getMessage());
            e.printStackTrace();
            // Fallback: return token manually generated without auth manager check (since we just created user)
            // Or rethrow.
            throw new RuntimeException("Registration successful but auto-login failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }
}
