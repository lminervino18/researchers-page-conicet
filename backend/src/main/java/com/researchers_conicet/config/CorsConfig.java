package com.researchers_conicet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.http.HttpHeaders;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // Allow frontend URLs
        String allowedOriginHost = System.getenv("ALLOWED_ORIGIN_HOST");
        String allowedPort = System.getenv("ALLOWED_PORT");
        String allowedAltPort = System.getenv("ALLOWED_ALT_PORT");
        String allowedOrigin = (allowedOriginHost != null && allowedPort != null)
            ? allowedOriginHost + ":" + allowedPort
            : "http://localhost:5173";
        String allowedAltOrigin = (allowedOriginHost != null && allowedAltPort != null)
            ? allowedOriginHost + ":" + allowedAltPort
            : "http://localhost:5174";
        corsConfiguration.addAllowedOrigin(allowedOrigin);
        corsConfiguration.addAllowedOrigin(allowedAltOrigin);
        
        // Allow common HTTP methods
        corsConfiguration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Allow all headers
        corsConfiguration.addAllowedHeader("*");
        
        // Expose specific headers needed for PDF handling
        corsConfiguration.setExposedHeaders(Arrays.asList(
            HttpHeaders.CONTENT_DISPOSITION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.CONTENT_LENGTH,
            HttpHeaders.CACHE_CONTROL,
            HttpHeaders.PRAGMA,
            HttpHeaders.EXPIRES,
            "X-Requested-With"
        ));
        
        // Allow credentials
        corsConfiguration.setAllowCredentials(true);
        
        // Configure max age for preflight requests
        corsConfiguration.setMaxAge(3600L);
        
        // Create URL based configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Apply CORS configuration to all paths
        source.registerCorsConfiguration("/api/**", corsConfiguration);
        source.registerCorsConfiguration("/api/researches/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
}