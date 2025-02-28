package com.researchers_conicet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for development
            .csrf(csrf -> csrf.disable())
            // Configure CORS
            .cors(cors -> cors.configure(http))
            // Configure authorization
            .authorizeHttpRequests(auth -> auth
                // Allow all requests to /api/** endpoints
                .requestMatchers("/api/**").permitAll()
                // Require authentication for any other request
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}